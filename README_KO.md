<div align="center">
<img src="./docs/images/icon.svg" alt="프리뷰"/>

<h1 align="center">ChatGPT Next Web</h1>

개인 ChatGPT 웹 애플리케이션을 한 번의 클릭으로 무료로 배포하세요.

[데모 Demo](https://chat-gpt-next-web.vercel.app/) / [피드백 Issues](https://github.com/Yidadaa/ChatGPT-Next-Web/issues) / [Discord 참여](https://discord.gg/zrhvHCr79N) / [QQ 그룹](https://user-images.githubusercontent.com/16968934/228190818-7dd00845-e9b9-4363-97e5-44c507ac76da.jpeg) / [개발자에게 기부](https://user-images.githubusercontent.com/16968934/227772541-5bcd52d8-61b7-488c-a203-0330d8006e2b.jpg) / [기부 Donate](#기부-donate-usdt)

[![Vercel로 배포하기](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web)

[![Gitpod에서 열기](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

![메인 화면](./docs/images/cover.png)

</div>

## 사용 시작

1. [OpenAI API Key](https://platform.openai.com/account/api-keys)를 준비합니다.
2. 오른쪽 버튼을 클릭하여 배포를 시작하십시오: 
   [![Vercel로 배포하기](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FYidadaa%2FChatGPT-Next-Web&env=OPENAI_API_KEY&env=CODE&project-name=chatgpt-next-web&repository-name=ChatGPT-Next-Web). Github 계정으로 바로 로그인하십시오. API Key와 [페이지 접근 비밀번호](#페이지-접근-비밀번호-설정) CODE를 환경 변수 페이지에 입력하십시오.
3. 배포가 완료되면 사용을 시작하십시오.
4. (선택 사항) [사용자 정의 도메인 바인딩](https://vercel.com/docs/concepts/projects/domains/add-a-domain) : Vercel에서 할당한 도메인 DNS가 일부 지역에서 오염되어 있습니다. 사용자 정의 도메인을 바인딩하면 직접 연결할 수 있습니다.

## 업데이트 유지

위의 단계대로 프로젝트를 배포한 경우 "업데이트가 있습니다"라는 메시지가 항상 표시될 수 있습니다. 이는 Vercel이 기본적으로 새 프로젝트를 생성하고이 프로젝트를 포크하지 않기 때문입니다. 이 문제는 업데이트를 올바르게 감지할 수 없습니다.
아래 단계를 따라 다시 배포하십시오:

- 기존 저장소를 삭제합니다.
- 페이지 오른쪽 상단의 포크 버튼을 사용하여 이 프로젝트를 포크합니다.
- Vercel에서 다시 선택하여 배포하십시오. [자세한 튜토리얼 보기](./docs/vercel-cn.md#새-프로젝트-만드는-방법).

### 자동 업데이트 활성화

> Upstream Sync 오류가 발생한 경우 수동으로 Sync Fork를 한 번 실행하십시오!

프로젝트를 포크한 후 GitHub의 제한으로 인해 포크한 프로젝트의 동작 페이지에서 워크플로우를 수동으로 활성화해야 합니다. Upstream Sync Action을 활성화하면 매시간마다 자동 업데이트가 활성화됩니다:

![자동 업데이트](./docs/images/enable-actions.jpg)

![자동 업데이트 활성화](./docs/images/enable-actions-sync.jpg)

### 수동으로 코드 업데이트

수동으로 즉시 업데이트하려면 [GitHub 문서](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/working-with-forks/syncing-a-fork)에서 포크된 프로젝트를 어떻게 원본 코드와 동기화하는지 확인하십시오.

이 프로젝트에 별표/감시를 부여하거나 작성자를 팔로우하여 새 기능 업데이트 알림을 받을 수 있습니다.

## 페이지 접근 비밀번호 설정

> 비밀번호가 설정된 후, 사용자는 설정 페이지에서 접근 코드를 수동으로 입력하여 정상적으로 채팅할 수 있습니다. 그렇지 않으면 메시지를 통해 권한이 없는 상태가 표시됩니다.

> **경고** : 비밀번호의 길이를 충분히 길게 설정하십시오. 최소 7 자리 이상이 좋습니다. 그렇지 않으면 [해킹될 수 있습니다](https://github.com/Yidadaa/ChatGPT-Next-Web/issues/518).

이 프로젝트는 제한된 권한 제어 기능을 제공합니다. Vercel 프로젝트 컨트롤 패널의 환경 변수 페이지에서 `CODE`라는 환경 변수를 추가하십시오. 값은 쉼표로 구분된 사용자 정의 비밀번호로 설정됩니다. (아래 예시의 경우 `code1` `code2` `code3` 3개의 비밀번호가 생성됩니다.)

```
code1,code2,code3
```

이 환경 변수를 추가하거나 수정한 후에는 프로젝트를 다시 배포하여 변경 사항을 적용해야 합니다.

## 환경 변수
> 이 프로젝트에서 대부분의 설정 요소들은 환경 변수를 통해 설정됩니다. [Vercel 환경변수 수정 방법.](./docs/vercel-ko.md)。

## OPENAI_API_KEY (필수 항목)

OpenAI 키로, openai 계정 페이지에서 신청한 api key입니다.

## CODE (선택 가능)

접근 비밀번호로, 선택적입니다. 쉼표를 사용하여 여러 비밀번호를 구분할 수 있습니다.

**경고** : 이 항목을 입력하지 않으면, 누구나 여러분이 배포한 웹사이트를 직접 사용할 수 있게 됩니다. 이로 인해 토큰이 빠르게 소진될 수 있으므로, 이 항목을 반드시 입력하는 것이 좋습니다.

## BASE_URL (선택 가능)

> 기본값: `https://api.openai.com`

> 예시: `http://your-openai-proxy.com`

OpenAI 인터페이스 프록시 URL입니다. 만약, 수동으로 openai 인터페이스 proxy를 설정했다면, 이 항목을 입력하셔야 합니다.

**참고**: SSL 인증서 문제가 발생한 경우, BASE_URL의 프로토콜을 http로 설정하세요.

## OPENAI_ORG_ID (선택 가능)

OpenAI 내의 조직 ID를 지정합니다.

## HIDE_USER_API_KEY (선택 가능)

사용자가 API Key를 직접 입력하는 것을 원하지 않는 경우, 이 환경 변수를 1로 설정하세요.

## DISABLE_GPT4 (선택 가능)

사용자가 GPT-4를 사용하는 것을 원하지 않는 경우, 이 환경 변수를 1로 설정하세요.

## HIDE_BALANCE_QUERY (선택 가능)

사용자가 잔액을 조회하는 것을 원하지 않는 경우, 이 환경 변수를 1로 설정하세요.

## 개발

아래 버튼을 클릭하여 개발을 시작하세요:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/#https://github.com/Yidadaa/ChatGPT-Next-Web)

코드 작성을 전, 프로젝트 루트 디렉토리에 `.env.local` 파일을 새로 만들고 해당 파일에 환경 변수를 입력해야 합니다:

```
OPENAI_API_KEY=<여기에 여러분의 api 키를 입력하세요>

#중국 사용자들은 이 프로젝트에 포함된 프록시를 사용하여 개발할 수 있습니다. 또는 다른 프록시 주소를 자유롭게 선택할 수 있습니다.
BASE_URL=https://chatgpt1.nextweb.fun/api/proxy
```


### 로컬 환경에서의 개발

1. nodejs 18과 yarn을 설치하세요. 자세한 사항은 ChatGPT에 문의하십시오.
2. `yarn install && yarn dev` 명령을 실행하세요. ⚠️ 주의: 이 명령은 로컬 개발 전용입니다. 배포용으로 사용하지 마십시오!
3. 로컬에서 배포하고 싶다면, `yarn install && yarn build && yarn start` 명령을 사용하세요. pm2와 함께 사용하여 프로세스를 보호하고, 강제 종료되지 않도록 할 수 있습니다. 자세한 내용은 ChatGPT에 문의하세요.

## 배포

### 컨테이너 배포 (추천)

> Docker 버전은 20 이상이어야 합니다. 그렇지 않으면 이미지를 찾을 수 없다는 메시지가 표시됩니다.

> ⚠️ 주의: docker 버전은 대부분의 경우 최신 버전보다 1~2일 뒤처집니다. 따라서 배포 후 "업데이트 가능" 알림이 지속적으로 나타날 수 있으며, 이는 정상적인 현상입니다.

```shell
docker pull yidadaa/chatgpt-next-web

docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="페이지 접근 비밀번호" \
   yidadaa/chatgpt-next-web
```

프록시를 지정하려면 다음을 사용하세요:

```shell
docker run -d -p 3000:3000 \
   -e OPENAI_API_KEY="sk-xxxx" \
   -e CODE="페이지 접근 비밀번호" \
   --net=host \
   -e PROXY_URL="http://127.0.0.1:7890" \
   yidadaa/chatgpt-next-web
```

로컬 프록시에 사용자 이름과 비밀번호가 필요한 경우, 아래와 같이 사용하세요:

```shell
-e PROXY_URL="http://127.0.0.1:7890 사용자이름 비밀번호"
```

다른 환경 변수를 지정해야 하는 경우, 위의 명령에 `-e 환경변수=환경변수값`을 추가하여 지정하세요.

### 로컬 배포

콘솔에서 아래의 명령을 실행하세요:

```shell
bash <(curl -s https://raw.githubusercontent.com/Yidadaa/ChatGPT-Next-Web/main/scripts/setup.sh)
```

⚠️ 주의: 설치 중 문제가 발생한 경우, docker로 배포하세요.

## 감사의 말

### 기부자

> 영문 버전 참조.

### 기여자

[프로젝트 기여자 목록 보기](https://github.com/Yidadaa/ChatGPT-Next-Web/graphs/contributors)

### 관련 프로젝트
- [one-api](https://github.com/songquanpeng/one-api): 통합 대형 모델 할당 관리 플랫폼, 주요 대형 언어 모델 모두 지원

## 오픈소스 라이센스

[MIT](https://opensource.org/license/mit/)
