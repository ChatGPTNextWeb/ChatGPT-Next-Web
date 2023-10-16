# Sincronizzare i Log delle Chat con UpStash
## Prerequisiti
- Account GitHub
- Server ChatGPT-Next-Web di propria configurazione
- [UpStash](https://upstash.com)

## Per iniziare
1. Registrarsi per un account UpStash.
2. Creare un database.

    ![Registrarsi ed Accedere](./images/upstash-1.png)

    ![Creare un Database](./images/upstash-2.png)

    ![Selezionare il Server](./images/upstash-3.png)

3. Trovare l'API REST e copiare UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN (⚠Importante⚠: Non condividere il token!)

   ![Copia](./images/upstash-4.png)

4. Copiare UPSTASH_REDIS_REST_URL e UPSTASH_REDIS_REST_TOKEN nella configurazione di sincronizzazione, quindi fare clic su **Verifica la Disponibilità**.

    ![Sincronizzazione 1](./images/upstash-5.png)

    Se tutto è in ordine, hai completato con successo questa fase.

    ![Verifica la Disponibilità della Sincronizzazione Completata](./images/upstash-6.png)

5. Successo!

   ![Ottimo lavoro~!](./images/upstash-7.png)