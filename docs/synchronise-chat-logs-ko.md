# UpStash를 사용하여 채팅 기록 동기화
## 사전 준비물
- GitHub 계정
- 자체 ChatGPT-Next-Web 서버 설정
- [UpStash](https://upstash.com)

## 시작하기
1. UpStash 계정 등록
2. 데이터베이스 생성

    ![등록 및 로그인](./images/upstash-1.png)

    ![데이터베이스 생성](./images/upstash-2.png)

    ![서버 선택](./images/upstash-3.png)

3. REST API를 찾아 UPSTASH_REDIS_REST_URL 및 UPSTASH_REDIS_REST_TOKEN을 복사합니다 (⚠주의⚠: 토큰을 공유하지 마십시오!)

   ![복사](./images/upstash-4.png)

4. UPSTASH_REDIS_REST_URL 및 UPSTASH_REDIS_REST_TOKEN을 동기화 구성에 복사한 다음 **가용성 확인**을 클릭합니다.

    ![동기화 1](./images/upstash-5.png)

    모든 것이 정상인 경우,이 단계를 성공적으로 완료했습니다.

    ![동기화 가용성 확인 완료](./images/upstash-6.png)

5. 성공!

   ![잘 했어요~!](./images/upstash-7.png)