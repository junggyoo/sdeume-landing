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
    # NumPy 1.x를 먼저 설치 (PyTorch와 호환성 문제 방지)
    .pip_install("numpy<2")
    .pip_install(
        "torch==2.4.0",
        "torchvision==0.19.0",
        "torchaudio==2.4.0",
        extra_index_url="https://download.pytorch.org/whl/cu121",
    )
    .pip_install(
        "comfy-cli",
        "aiohttp",
        "requests",
        "Pillow",
        "ultralytics",
        "opencv-python-headless",
        "scikit-image",
        "piexif",
        "fastapi",
        "dill",  # Impact-Subpack 의존성
        "segment-anything",  # Impact Pack 의존성
    )
    .run_commands(
        # ComfyUI 설치
        "comfy --skip-prompt install --nvidia",
    )
    .run_commands(
        # Impact Pack 설치 (git clone으로 직접 설치)
        "cd /root/comfy/ComfyUI/custom_nodes && git clone https://github.com/ltdrdata/ComfyUI-Impact-Pack.git",
        # Impact Pack 의존성 설치
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Impact-Pack && pip install -r requirements.txt || true",
        # Impact Subpack 설치 (UltralyticsDetectorProvider)
        "cd /root/comfy/ComfyUI/custom_nodes && git clone https://github.com/ltdrdata/ComfyUI-Impact-Subpack.git",
        # Impact Subpack 의존성 설치
        "cd /root/comfy/ComfyUI/custom_nodes/ComfyUI-Impact-Subpack && pip install -r requirements.txt || true",
    )
)

# 워크플로우 JSON (직접 임베드)
WORKFLOW_JSON = r'''
{
  "3": {
    "inputs": {
      "seed": 1103471731063007,
      "steps": 20,
      "cfg": 1,
      "sampler_name": "euler",
      "scheduler": "simple",
      "denoise": 1,
      "model": ["34", 0],
      "positive": ["6", 0],
      "negative": ["7", 0],
      "latent_image": ["5", 0]
    },
    "class_type": "KSampler",
    "_meta": {"title": "KSampler"}
  },
  "4": {
    "inputs": {"ckpt_name": "flux1-dev-fp8.safetensors"},
    "class_type": "CheckpointLoaderSimple",
    "_meta": {"title": "체크포인트 로드"}
  },
  "5": {
    "inputs": {"width": 1024, "height": 1024, "batch_size": 1},
    "class_type": "EmptyLatentImage",
    "_meta": {"title": "빈 잠재 이미지"}
  },
  "6": {
    "inputs": {
      "text": "(Front view, full frontal shot, facing camera directly, looking at viewer:1.4), (Full body shot:1.5), wide angle shot, A high-end editorial wedding photo of a Korean groom and a Korean bride standing side by side facing forward in a luxury Cheongdam-dong minimal studio.\n\n(Background): Clean white horizon, soft shadows, minimalist classic molding wall, elegant atmosphere.\n\n(Groom styling): The groom is standing tall facing the camera, wearing a perfectly tailored black tuxedo, black bow tie, and shiny patent leather shoes. He has a (trendy Korean Guile cut hairstyle:1.3), wet hair styling, clean and sophisticated look. He is looking straight at the camera with a gentle smile.\n\n(Bride styling): The bride is wearing a luxurious (Mermaid line wedding dress:1.2) that accentuates her figure, with intricate lace details and a long veil flowing down. She has a (modern low bun hairstyle:1.3) with (wispy side bangs:1.2). She is wearing high heels, standing gracefully facing forward, looking straight at the camera.\n\n(Lighting & Quality): Softbox studio lighting, high-key lighting, soft skin texture, 8k resolution, highly detailed fabric texture, Vogue Korea style, sharp focus, professional photography, Canon R5, 85mm lens.\n\n(western, caucasian, white people, foreigner, american, european:1.3), blue eyes, blonde hair,\n(malformed hands, fused fingers, too many fingers, missing fingers, extra fingers:1.3), impossible hand pose, claw, paw, floating hands, long fingers, bad anatomy, bad proportions, malformed limbs, extra limbs, missing limbs, disconnected limbs, long neck, mutated, deformed, disfigured, (illustration, painting, drawing, anime, cartoon, 3d render:1.2), text, watermark, signature, logo, low quality, worst quality, lowres, glitch, cropped, casual clothes, jeans, messy, dark, gloomy",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  },
  "7": {
    "inputs": {
      "text": "(western, caucasian, white people, foreigner, american, european:1.3), blue eyes, blonde hair,\n(malformed hands, fused fingers, too many fingers, missing fingers, extra fingers:1.3), impossible hand pose, claw, paw, floating hands, long fingers, bad anatomy, bad proportions, malformed limbs, extra limbs, missing limbs, disconnected limbs, long neck, mutated, deformed, disfigured, (illustration, painting, drawing, anime, cartoon, 3d render:1.2), text, watermark, signature, logo, low quality, worst quality, lowres, glitch, cropped, casual clothes, jeans, messy, dark, gloomy",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  },
  "8": {
    "inputs": {"samples": ["3", 0], "vae": ["4", 2]},
    "class_type": "VAEDecode",
    "_meta": {"title": "VAE 디코드"}
  },
  "14": {
    "inputs": {
      "lora_name": "groom_lora.safetensors",
      "strength_model": 1,
      "strength_clip": 1,
      "model": ["34", 0],
      "clip": ["34", 1]
    },
    "class_type": "LoraLoader",
    "_meta": {"title": "LoRA 로드"}
  },
  "15": {
    "inputs": {
      "lora_name": "bride_lora.safetensors",
      "strength_model": 1,
      "strength_clip": 1,
      "model": ["34", 0],
      "clip": ["34", 1]
    },
    "class_type": "LoraLoader",
    "_meta": {"title": "LoRA 로드"}
  },
  "19": {
    "inputs": {"model_name": "bbox/face_yolov8m.pt"},
    "class_type": "UltralyticsDetectorProvider",
    "_meta": {"title": "UltralyticsDetectorProvider"}
  },
  "21": {
    "inputs": {
      "text": "closeup of Korean TNDDMAN man, (East Asian facial features:1.2), brown eyes, black hair, (trendy Guile cut hairstyle:1.3), (wet hair styling:1.2), gentle smile, (cinematic lighting, warm spotlight:1.2)\n",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  },
  "23": {
    "inputs": {
      "text": "closeup of Korean KIMJJ woman, (East Asian facial features:1.2), brown eyes, black hair, (modern low bun hairstyle:1.2), (wispy side bangs:1.2), soft makeup, (cinematic lighting, warm spotlight:1.2)\n",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  },
  "24": {
    "inputs": {"filename_prefix": "lora", "images": ["37", 0]},
    "class_type": "SaveImage",
    "_meta": {"title": "이미지 저장"}
  },
  "26": {
    "inputs": {
      "text": "woman, girl, female, makeup, lipstick, feminine, earrings, long hair, bad anatomy, distortion, low quality, worst quality, (western, caucasian, white people, foreigner, american, european:1.3), blue eyes, blonde hair",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  },
  "27": {
    "inputs": {
      "text": "man, boy, male, beard, mustache, masculine, bad anatomy, distortion, low quality, worst quality, (western, caucasian, white people, foreigner, american, european:1.3), blue eyes, blonde hair,",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  },
  "29": {
    "inputs": {
      "target": "area(=w*h)",
      "order": true,
      "take_start": 0,
      "take_count": 1,
      "segs": ["30", 0]
    },
    "class_type": "ImpactSEGSOrderedFilter",
    "_meta": {"title": "SEGS Filter (ordered)"}
  },
  "30": {
    "inputs": {
      "threshold": 0.25,
      "dilation": 10,
      "crop_factor": 5,
      "drop_size": 10,
      "labels": "all",
      "bbox_detector": ["19", 0],
      "image": ["8", 0]
    },
    "class_type": "BboxDetectorSEGS",
    "_meta": {"title": "BBOX Detector (SEGS)"}
  },
  "32": {
    "inputs": {
      "guide_size": 1024,
      "guide_size_for": true,
      "max_size": 1024,
      "seed": 163068160694334,
      "steps": 15,
      "cfg": 1,
      "sampler_name": "euler",
      "scheduler": "simple",
      "denoise": 0.6,
      "feather": 5,
      "noise_mask": true,
      "force_inpaint": true,
      "wildcard": "",
      "cycle": 1,
      "inpaint_model": false,
      "noise_mask_feather": 20,
      "tiled_encode": false,
      "tiled_decode": false,
      "image": ["8", 0],
      "segs": ["29", 0],
      "model": ["14", 0],
      "clip": ["14", 1],
      "vae": ["4", 2],
      "positive": ["21", 0],
      "negative": ["26", 0]
    },
    "class_type": "DetailerForEach",
    "_meta": {"title": "디테일러 (SEGS)"}
  },
  "33": {
    "inputs": {
      "guide_size": 1024,
      "guide_size_for": true,
      "max_size": 1024,
      "seed": 733073276389082,
      "steps": 15,
      "cfg": 1,
      "sampler_name": "euler",
      "scheduler": "simple",
      "denoise": 0.6,
      "feather": 5,
      "noise_mask": true,
      "force_inpaint": true,
      "wildcard": "",
      "cycle": 1,
      "inpaint_model": false,
      "noise_mask_feather": 20,
      "tiled_encode": false,
      "tiled_decode": false,
      "image": ["32", 0],
      "segs": ["29", 1],
      "model": ["15", 0],
      "clip": ["15", 1],
      "vae": ["4", 2],
      "positive": ["23", 0],
      "negative": ["27", 0]
    },
    "class_type": "DetailerForEach",
    "_meta": {"title": "디테일러 (SEGS)"}
  },
  "34": {
    "inputs": {
      "lora_name": "Flux-Realism.safetensors",
      "strength_model": 0.45,
      "strength_clip": 1,
      "model": ["4", 0],
      "clip": ["4", 1]
    },
    "class_type": "LoraLoader",
    "_meta": {"title": "LoRA 로드"}
  },
  "35": {
    "inputs": {"model_name": "bbox/hand_yolov8s.pt"},
    "class_type": "UltralyticsDetectorProvider",
    "_meta": {"title": "UltralyticsDetectorProvider"}
  },
  "36": {
    "inputs": {
      "threshold": 0.4,
      "dilation": 10,
      "crop_factor": 3,
      "drop_size": 10,
      "labels": "all",
      "bbox_detector": ["35", 0],
      "image": ["33", 0]
    },
    "class_type": "BboxDetectorSEGS",
    "_meta": {"title": "BBOX Detector (SEGS)"}
  },
  "37": {
    "inputs": {
      "guide_size": 512,
      "guide_size_for": true,
      "max_size": 1024,
      "seed": 964000217776175,
      "steps": 8,
      "cfg": 8,
      "sampler_name": "euler",
      "scheduler": "simple",
      "denoise": 0.35,
      "feather": 5,
      "noise_mask": true,
      "force_inpaint": true,
      "wildcard": "",
      "cycle": 1,
      "inpaint_model": false,
      "noise_mask_feather": 20,
      "tiled_encode": false,
      "tiled_decode": false,
      "image": ["33", 0],
      "segs": ["36", 0],
      "model": ["4", 0],
      "clip": ["34", 1],
      "vae": ["4", 2],
      "positive": ["38", 0],
      "negative": ["39", 0]
    },
    "class_type": "DetailerForEach",
    "_meta": {"title": "디테일러 (SEGS)"}
  },
  "38": {
    "inputs": {
      "text": "beautiful detailed hands, fingers, texture, anatomy",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  },
  "39": {
    "inputs": {
      "text": "extra fingers, missing fingers, mutated",
      "clip": ["34", 1]
    },
    "class_type": "CLIPTextEncode",
    "_meta": {"title": "CLIP 텍스트 인코딩 (프롬프트)"}
  }
}
'''


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
    scaledown_window=300,
    volumes={"/models": models_volume},
)
@modal.concurrent(max_inputs=4)
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

        # ComfyUI 서버 시작 (로그를 직접 출력하도록 변경)
        self.process = subprocess.Popen(
            ["python", "main.py", "--listen", "127.0.0.1", "--port", "8188"],
            cwd=comfyui_dir,
            stdout=None,  # 직접 출력
            stderr=None,  # 직접 출력
        )

        # 서버 준비 대기 (최대 180초로 증가 - 첫 시작 시 모델 로딩 시간 필요)
        max_wait = 180
        for i in range(max_wait):
            if self.check_server_ready():
                print(f"ComfyUI server ready! (took {i+1} seconds)")
                return
            if i % 10 == 0:
                print(f"Waiting for ComfyUI server... ({i}s)")
            time.sleep(1)

        raise RuntimeError("ComfyUI server failed to start within 180 seconds")

    @modal.exit()
    def stop_server(self):
        """컨테이너 종료 시 서버 정리"""
        if self.process:
            self.process.terminate()
            self.process.wait()
            print("ComfyUI server stopped")

    @modal.fastapi_endpoint(method="POST")
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

        # 워크플로우 로드 (임베드된 JSON 사용)
        workflow = json.loads(WORKFLOW_JSON)

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
