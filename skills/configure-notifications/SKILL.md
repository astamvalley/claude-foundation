---
name: configure-notifications
description: >
  Claude Code 알림을 설정하거나 제거한다 — macOS 시스템 알림, Slack 웹훅.
  "알림 설정해줘", "작업 완료 알림 받고 싶어", "슬랙으로 알려줘", "맥 알림 설정해줘" 할 때 사용.
  "알림 끄고 싶어", "알림 제거해줘" 같은 표현에도 동작한다.
disable-model-invocation: true
---

# Claude Code 알림 설정

Claude가 작업을 완료하거나 입력 대기 시 macOS 또는 Slack으로 알림을 보내도록 설정한다.

## 작업 순서

- [ ] 1단계: 현재 설정 상태 확인
- [ ] 2단계: 위자드로 설정/제거 진행
- [ ] 3단계: settings.json 업데이트
- [ ] 4단계: 테스트 알림 발송

## 1단계: 현재 설정 확인

시작 전에 반드시 현재 상태를 읽는다:

```bash
python3 -c "
import json, os
path = os.path.expanduser('~/.claude/settings.json')
try:
    s = json.load(open(path))
    hooks = s.get('hooks', {}).get('Notification', [])
    cmds = [h['command'] for g in hooks for h in g.get('hooks', []) if h.get('type') == 'command']
    macos = any('osascript' in c for c in cmds)
    slack = any('slack' in c.lower() or 'hooks.slack.com' in c for c in cmds)
    print(f'macos={macos}')
    print(f'slack={slack}')
except:
    print('macos=false')
    print('slack=false')
"
```

## 2단계: 위자드 실행

`AskUserQuestion`으로 현재 상태를 반영한 선택지를 제공한다.

- 설정된 항목: label에 `✓ 설정됨` 표시
- 미설정 항목: label에 `○ 미설정` 표시

**Question:** "어떤 알림을 설정/관리할까요?"

**Options:**
1. `macOS 시스템 알림 ✓ 설정됨` 또는 `macOS 시스템 알림 ○ 미설정`
2. `Slack 알림 ✓ 설정됨` 또는 `Slack 알림 ○ 미설정`

선택 후 분기:
- **설정됨 항목 선택** → "현재 설정되어 있습니다. 제거하시겠어요?" (Yes/No)
- **미설정 항목 선택** → 해당 설정 진행

## 3단계: macOS 알림 설정/제거

### 설정

`settings.json`의 `hooks.Notification`에 아래 항목을 추가한다:

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "osascript -e 'display notification \"$CLAUDE_NOTIFICATION\" with title \"Claude Code\" sound name \"Glass\"'"
    }
  ]
}
```

설정 후 테스트:
```bash
osascript -e 'display notification "테스트 알림입니다" with title "Claude Code" sound name "Glass"'
```

알림이 뜨지 않으면: 시스템 설정 > 알림 > Script Editor 또는 Terminal 알림 허용 안내.

### 제거

`hooks.Notification` 배열에서 `osascript`가 포함된 항목을 찾아 제거한다.

## 4단계: Slack 알림 설정/제거

### 설정

웹훅 URL을 입력받는다:

**Question:** "Slack 웹훅 URL을 입력해주세요."

웹훅 URL 발급 방법:
```
1. api.slack.com/apps → Create New App → From scratch
2. Incoming Webhooks → Activate → Add New Webhook to Workspace
3. 채널 선택 후 URL 복사
```

URL 유효성 검사: `https://hooks.slack.com/services/`로 시작해야 함.

`settings.json`의 `hooks.Notification`에 추가:

```json
{
  "matcher": "",
  "hooks": [
    {
      "type": "command",
      "command": "curl -s -o /dev/null -X POST -H 'Content-type: application/json' --data '{\"text\":\"Claude Code: $CLAUDE_NOTIFICATION\"}' 'WEBHOOK_URL_HERE'"
    }
  ]
}
```

설정 후 테스트:
```bash
curl -s -X POST -H 'Content-type: application/json' \
  --data '{"text":"Claude Code 알림 테스트입니다 ✓"}' \
  'WEBHOOK_URL_HERE'
```

응답이 `ok`면 성공.

### 제거

`hooks.Notification` 배열에서 `hooks.slack.com`이 포함된 항목을 찾아 제거한다.

## settings.json 업데이트 방법

기존 설정을 보존하면서 안전하게 머지한다:

```python
import json, os

path = os.path.expanduser('~/.claude/settings.json')
s = json.load(open(path)) if os.path.exists(path) else {}
s.setdefault('hooks', {}).setdefault('Notification', [])

# 추가 시: s['hooks']['Notification'].append(NEW_ENTRY)
# 제거 시: 해당 항목 필터링 후 재할당

with open(path, 'w') as f:
    json.dump(s, f, indent=2, ensure_ascii=False)
```

## Gotchas

- `$CLAUDE_NOTIFICATION` — Claude Code가 Notification hook에 전달하는 메시지 내용. 환경변수로 자동 주입됨.
- macOS 알림이 안 뜨면 — Terminal/Script Editor의 알림 권한 문제. 시스템 설정 > 알림에서 허용 필요.
- settings.json이 없으면 — `{}` 에서 시작해서 새로 생성하면 됨.
- Slack URL을 shell 커맨드에 넣을 때 — 작은따옴표로 감싸서 특수문자 이스케이프 문제 방지.
