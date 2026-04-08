---
name: branch-cleanup
description: "워크스페이스 내 git 프로젝트들의 머지 완료된 로컬 브랜치를 일괄 정리한다. 리모트는 건드리지 않고 로컬 브랜치만 삭제한다. '브랜치 정리', 'branch cleanup', '로컬 브랜치 삭제', '브랜치 청소' 요청 시 사용."
allowed_tools: ["Bash", "AskUserQuestion"]
---

# 로컬 브랜치 정리

워크스페이스 내 git 프로젝트들의 머지 완료된 로컬 브랜치를 일괄 정리한다.
**리모트는 절대 건드리지 않는다. `git branch -d`로 로컬 브랜치만 삭제한다.**

## 실행 절차

### 1. 대상 경로 판별

현재 작업 디렉토리(또는 사용자 지정 경로)를 기준으로 아래 순서로 판별한다.

**단일 레포 모드** — 대상 경로 자체에 `.git`이 있으면 그 레포 하나만 처리한다.
```bash
[ -d "<target>/.git" ] && echo "<target>"
```

**워크스페이스 모드** — `.git`이 없으면 서브디렉토리를 탐색해 git 레포 목록을 수집한다.
```bash
ls -d <target>/*/ | while read dir; do
  if [ -d "$dir/.git" ]; then echo "$dir"; fi
done
```

두 모드 모두 이후 절차(fetch → 분석 → 삭제)는 동일하게 적용된다.

### 2. 프로젝트별 분석 (병렬 실행 권장)

각 프로젝트에 대해 다음을 수행한다:

#### 2-1. 리모트 동기화

```bash
git fetch origin --prune
```

#### 2-2. 브랜치 정보 수집

```bash
git branch -vv
```

#### 2-3. 삭제 대상 판별

다음 **두 가지 조건**으로 삭제 대상을 판별한다:

**조건 A: 메인 브랜치에 머지됨**
```bash
git branch --merged <main-branch>
```
- `<main-branch>`는 프로젝트에 따라 `main` 또는 `master`

**조건 B: 장기 피처 브랜치에 머지됨**
- 현재 체크아웃된 브랜치가 `release/*`, `feature/epic-*` 같은 장기 피처 브랜치인 경우:
```bash
git branch --merged <long-lived-feature-branch>
```

**삭제 대상 = (조건 A 또는 조건 B) 에 해당하는 브랜치**

#### 2-4. 제외 대상

다음 브랜치는 항상 제외한다:
- 현재 체크아웃된 브랜치 (`*` 표시)
- 보호 브랜치: `main`, `master`, `devel`, `develop`, `release`, `staging`
- 리모트가 존재하고 ahead 상태인 브랜치 (push 안 된 작업이 있을 수 있음)

#### 2-5. 추가 참고 정보

각 브랜치에 대해 다음 정보를 함께 표시한다:
- 어디에 머지되었는지 (main/master, 장기 피처 브랜치)
- 리모트 상태 (gone, 존재, 없음)

### 3. 결과 리포트

프로젝트별로 다음을 정리하여 사용자에게 보여준다:

```markdown
## 프로젝트별 브랜치 정리 현황

### <프로젝트명> - 삭제 대상 N개
| 브랜치 | 머지 대상 | 리모트 |
|--------|----------|--------|
| feature/XXX | main | gone |
| feature/YYY | release/2.0 | gone |

남는 브랜치: main, devel, * current-branch

### (프로젝트가 깨끗한 경우)
### <프로젝트명> - 삭제 대상 0개 (깨끗함)

## 총 요약
| 프로젝트 | 삭제 대상 | 남는 브랜치 |
|---------|:---------:|:---------:|
| ... | N | M |
| 합계 | XX개 | YY개 |
```

**주의사항 별도 표시:**
- main에 미머지이나 리모트가 gone인 브랜치 (squash merge 가능성) → `⚠️` 표시
- 리모트가 존재하며 ahead/behind 상태인 브랜치 → 보존 이유 명시
- 현재 브랜치여서 `-d`가 안 되는 경우 → 전환 필요 안내

### 4. 사용자 확인

리포트를 보여준 후 AskUserQuestion으로 확인한다:
- "전부 진행할까요? 변경사항이 있으면 말씀해주세요."
- 사용자가 특정 브랜치 제외/추가를 요청하면 반영한다.

### 5. 삭제 실행

**반드시 `git branch -d` (소문자 d)만 사용한다.** `-D` (대문자)는 사용자가 명시적으로 요청한 경우에만 사용.

```bash
cd <project-path> && git branch -d <branch1> <branch2> ...
```

- 프로젝트별로 병렬 실행 가능
- 현재 브랜치여서 삭제가 안 되는 경우, 메인 브랜치로 전환 후 삭제
- `-d`가 거부된 경우 (미머지), 사용자에게 개별적으로 `-D` 여부를 확인

### 6. 완료 요약

```markdown
| 프로젝트 | 삭제 | 결과 |
|---------|:----:|:----:|
| project-a | 10 | ✅ |
| project-b | 5 | ✅ |
| 합계 | 15개 | ✅ |

미처리: (있는 경우만)
- fe-lab feature/xxx — 사유
```

## 중요 사항

- **리모트는 절대 건드리지 않는다.** `git push --delete` 등 리모트 삭제 명령은 사용하지 않는다.
- `-d` 옵션만 사용하여 안전하게 삭제한다 (머지되지 않은 브랜치는 git이 자동 차단).
- 에러 발생 시 해당 프로젝트만 건너뛰고 나머지를 계속 진행한다.
- 삭제 대상이 0개인 프로젝트는 "깨끗함"으로 표시하고 넘어간다.

## 출력 규약

<!-- SKILL_OUTPUT -->
skill: branch-cleanup
status: success
data:
  total_deleted: <삭제된 총 브랜치 수>
  projects_cleaned: <정리된 프로젝트 수>
  projects_skipped: <삭제 대상 없는 프로젝트 수>
  errors: <에러 발생 프로젝트 목록 또는 null>
<!-- /SKILL_OUTPUT -->
