# SdmAI Modal Backend

ComfyUI + Impact Pack 기반 웨딩 사진 생성 서버입니다.

## 사전 요구사항

1. Python 3.10 이상
2. Modal CLI 설치 및 인증

```bash
pip install modal
modal setup
```

## 배포 방법

### 1. 모델 다운로드 (최초 1회)

```bash
cd modal
modal run download_models.py::download_all_models
```

다운로드되는 모델:
- `flux1-dev-fp8.safetensors` (~17GB)
- `Flux-Realism.safetensors` (~340MB)
- `face_yolov8m.pt` (~52MB)
- `hand_yolov8s.pt` (~22MB)

### 2. 백엔드 배포

```bash
modal deploy sdmai_modal.py
```

배포 완료 후 터미널에 표시되는 URL을 복사하세요:
```
https://YOUR_USERNAME--sdmai-comfyui-comfyuiserver-generate.modal.run
```

### 3. 환경변수 설정

`.env.local` 파일에 Modal API URL을 설정하세요:

```bash
MODAL_API_URL=https://YOUR_USERNAME--sdmai-comfyui-comfyuiserver-generate.modal.run
```

## 로컬 테스트

```bash
# Modal 서버 로컬 실행
modal serve sdmai_modal.py

# API 테스트
curl -X POST http://localhost:8000 \
  -H "Content-Type: application/json" \
  -d '{"prompt": "wedding photo test"}'
```

## 유틸리티 명령어

```bash
# 설치된 모델 확인
modal run download_models.py::list_models

# 모든 모델 삭제 (주의!)
modal run download_models.py::clear_models
```

## API 스펙

### POST /generate

**Request:**
```json
{
  "prompt": "optional custom prompt",
  "groomLoraUrl": "https://url/to/groom_lora.safetensors",
  "brideLoraUrl": "https://url/to/bride_lora.safetensors"
}
```

**Response:**
```json
{
  "images": [
    {
      "base64": "iVBORw0KGgo...",
      "content_type": "image/png",
      "width": 1024,
      "height": 1024
    }
  ]
}
```

## 비용 정보

- GPU: A10G (~$1.10/hr)
- 컨테이너 유휴 시간: 5분 후 자동 종료
- 사용한 시간만 과금

## 트러블슈팅

### Cold Start가 느린 경우

첫 요청 시 컨테이너 시작에 1-2분이 소요될 수 있습니다.
이후 요청은 빠르게 처리됩니다.

### 모델 다운로드 실패

```bash
# 모델 목록 확인
modal run download_models.py::list_models

# 누락된 모델만 다시 다운로드
modal run download_models.py::download_all_models
```
