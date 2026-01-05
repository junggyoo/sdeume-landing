"""
SdmAI Modal Backend
ComfyUI + Impact Pack 기반 웨딩 사진 생성 서버
"""

import modal
import os
import json
import time
import base64
import subprocess
from pathlib import Path

# Modal 앱 정의
app = modal.App("sdmai-comfyui")

# 모델 저장용 Volume
models_volume = modal.Volume.from_name("sdmai-models", create_if_missing=True)

# ComfyUI 이미지 정의
image = (
    modal.Image.debian_slim(python_version="3.11")
    .apt_install(
        "git",
        "wget",
        "curl",
        "libgl1-mesa-glx",
        "libglib2.0-0",
        "libsm6",
        "libxrender1",
        "libxext6",
        "ffmpeg",
    )
    .pip_install(
        "torch==2.1.0",
        "torchvision==0.16.0",
        "torchaudio==2.1.0",
        extra_index_url="https://download.pytorch.org/whl/cu121",
    )
    .pip_install(
        "comfy-cli",
        "aiohttp",
        "requests",
        "Pillow",
        "numpy",
        "ultralytics",
        "opencv-python-headless",
        "scikit-image",
        "piexif",
        "fastapi",
    )
    .run_commands(
        # ComfyUI 설치
        "comfy --skip-prompt install --nvidia",
        # Impact Pack 설치
        "comfy node install ComfyUI-Impact-Pack",
        # Impact Subpack 설치 (UltralyticsDetectorProvider)
        "cd /root/comfy/ComfyUI/custom_nodes && git clone https://github.com/ltdrdata/ComfyUI-Impact-Subpack.git || true",
    )
)

# 워크플로우 JSON 경로
WORKFLOW_PATH = Path(__file__).parent / "workflow_api.json"


def download_file(url: str, dest: str) -> bool:
    """URL에서 파일 다운로드"""
    import requests

    try:
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        response = requests.get(url, stream=True, timeout=300)
        response.raise_for_status()

        with open(dest, "wb") as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return True
    except Exception as e:
        print(f"Download failed: {url} -> {e}")
        return False


@app.cls(
    image=image,
    gpu="A10G",
    timeout=600,
    container_idle_timeout=300,
    volumes={"/models": models_volume},
    allow_concurrent_inputs=4,
)
class ComfyUIServer:
    """ComfyUI 서버 클래스"""

    process: subprocess.Popen = None

    def check_server_ready(self) -> bool:
        """ComfyUI 서버 준비 상태 확인"""
        import requests

        try:
            response = requests.get("http://127.0.0.1:8188/system_stats", timeout=5)
            return response.status_code == 200
        except Exception:
            return False

    @modal.enter()
    def start_server(self):
        """컨테이너 시작 시 ComfyUI 서버 실행"""
        import shutil

        print("Starting ComfyUI server...")

        comfyui_dir = "/root/comfy/ComfyUI"
        comfyui_models_dir = f"{comfyui_dir}/models"
        volume_models_dir = "/models"

        # 기존 models 폴더 삭제하고 심볼릭 링크 생성
        if os.path.exists(comfyui_models_dir):
            if os.path.islink(comfyui_models_dir):
                os.unlink(comfyui_models_dir)
            else:
                shutil.rmtree(comfyui_models_dir)

        os.symlink(volume_models_dir, comfyui_models_dir)
        print(f"Created symlink: {comfyui_models_dir} -> {volume_models_dir}")

        # 볼륨 내 디렉토리 확인
        os.makedirs(f"{volume_models_dir}/checkpoints", exist_ok=True)
        os.makedirs(f"{volume_models_dir}/loras", exist_ok=True)
        os.makedirs(f"{volume_models_dir}/ultralytics/bbox", exist_ok=True)

        # ComfyUI 서버 시작
        self.process = subprocess.Popen(
            ["python", "main.py", "--listen", "127.0.0.1", "--port", "8188"],
            cwd=comfyui_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )

        # 서버 준비 대기 (최대 120초)
        max_wait = 120
        for i in range(max_wait):
            if self.check_server_ready():
                print(f"ComfyUI server ready! (took {i+1} seconds)")
                return
            time.sleep(1)

        raise RuntimeError("ComfyUI server failed to start within 120 seconds")

    @modal.exit()
    def stop_server(self):
        """컨테이너 종료 시 서버 정리"""
        if self.process:
            self.process.terminate()
            self.process.wait()
            print("ComfyUI server stopped")

    @modal.web_endpoint(method="POST")
    def generate(self, request: dict):
        """이미지 생성 API 엔드포인트"""
        import requests

        comfyui_dir = "/root/comfy/ComfyUI"
        models_dir = "/models"  # 볼륨 직접 경로 사용

        # 요청 파라미터 추출
        prompt = request.get("prompt")
        groom_lora_url = request.get("groomLoraUrl")
        bride_lora_url = request.get("brideLoraUrl")

        print(f"Generate request - prompt: {prompt[:50] if prompt else 'None'}...")

        # 동적 LoRA 다운로드
        if groom_lora_url:
            groom_lora_path = f"{models_dir}/loras/groom_lora.safetensors"
            if not os.path.exists(groom_lora_path):
                print(f"Downloading groom LoRA from {groom_lora_url}")
                download_file(groom_lora_url, groom_lora_path)

        if bride_lora_url:
            bride_lora_path = f"{models_dir}/loras/bride_lora.safetensors"
            if not os.path.exists(bride_lora_path):
                print(f"Downloading bride LoRA from {bride_lora_url}")
                download_file(bride_lora_url, bride_lora_path)

        # 워크플로우 로드
        workflow_file = WORKFLOW_PATH
        if not workflow_file.exists():
            # 번들된 워크플로우가 없으면 기본 경로에서 시도
            workflow_file = Path("/root/comfy/ComfyUI/workflow_api.json")

        with open(workflow_file, "r") as f:
            workflow = json.load(f)

        # 워크플로우 동적 수정
        if prompt:
            # 메인 프롬프트 수정 (노드 6)
            if "6" in workflow and "inputs" in workflow["6"]:
                # 기존 프롬프트에 사용자 프롬프트 추가
                base_prompt = workflow["6"]["inputs"].get("text", "")
                workflow["6"]["inputs"]["text"] = f"{prompt}, {base_prompt}"

        # 랜덤 시드 적용 (매번 다른 이미지 생성)
        import random
        random_seed = random.randint(0, 2**53)

        if "3" in workflow and "inputs" in workflow["3"]:
            workflow["3"]["inputs"]["seed"] = random_seed

        # ComfyUI에 워크플로우 전송
        try:
            response = requests.post(
                "http://127.0.0.1:8188/prompt",
                json={"prompt": workflow},
                timeout=30,
            )
            response.raise_for_status()
            prompt_id = response.json()["prompt_id"]
            print(f"Workflow queued: {prompt_id}")
        except Exception as e:
            return {"error": f"Failed to queue workflow: {str(e)}"}

        # 결과 대기 (최대 5분)
        output_images = []
        max_wait = 300

        for i in range(max_wait):
            try:
                history_response = requests.get(
                    f"http://127.0.0.1:8188/history/{prompt_id}",
                    timeout=10,
                )
                history = history_response.json()

                if prompt_id in history:
                    outputs = history[prompt_id].get("outputs", {})

                    for node_id, node_output in outputs.items():
                        if "images" in node_output:
                            for img in node_output["images"]:
                                img_path = f"{comfyui_dir}/output/{img['filename']}"

                                if os.path.exists(img_path):
                                    with open(img_path, "rb") as f:
                                        img_data = f.read()
                                        img_base64 = base64.b64encode(img_data).decode("utf-8")
                                        output_images.append({
                                            "base64": img_base64,
                                            "content_type": "image/png",
                                            "width": 1024,
                                            "height": 1024,
                                        })

                    if output_images:
                        print(f"Generation complete! {len(output_images)} images")
                        break

            except Exception as e:
                print(f"Waiting for result... ({i+1}s) - {e}")

            time.sleep(1)

        if not output_images:
            return {"error": "Image generation timed out or failed"}

        return {"images": output_images}


# 모델 다운로드 상태 확인용 함수
@app.function(
    image=image,
    volumes={"/models": models_volume},
    timeout=60,
)
def check_models():
    """설치된 모델 확인"""
    models_dir = "/models"

    result = {
        "checkpoints": [],
        "loras": [],
        "ultralytics": [],
    }

    for subdir in ["checkpoints", "loras", "ultralytics/bbox"]:
        path = f"{models_dir}/{subdir}"
        if os.path.exists(path):
            files = os.listdir(path)
            key = subdir.split("/")[0]
            result[key].extend(files)

    return result


if __name__ == "__main__":
    # 로컬 테스트용
    print("Modal app defined. Deploy with: modal deploy sdmai_modal.py")
