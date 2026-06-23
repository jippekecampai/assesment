# Deploy naar Azure App Service

De app draait als Node-app op Azure App Service (Linux). `server.mjs` luistert op
`process.env.PORT` en bindt `0.0.0.0` zodra `WEBSITE_SITE_NAME` gezet is (dat doet App
Service automatisch). Deployen gebeurt via de GitHub Actions-workflow
`.github/workflows/azure-deploy.yml` — bij elke push naar `main`.

## Eenmalige setup (publish profile — minste stappen)

1. **Azure Portal** → App Service **`cmp-app-assessment-test-weu-001`** → bovenin
   **"Download publish profile"**. Je krijgt een `.PublishSettings`-bestand (XML).
2. **GitHub** → repo `jippekecampai/assesment` → **Settings → Secrets and variables →
   Actions → New repository secret**.
   - **Name:** `AZURE_WEBAPP_PUBLISH_PROFILE`
   - **Secret:** plak de **volledige inhoud** van het publish-profile-bestand.
3. Maak (eenmalig) een GitHub **Environment** `test` aan (Settings → Environments) — de
   workflow verwijst ernaar voor de deploy-URL. Niet verplicht, maar netjes.
4. **Startup-command** van de App Service controleren: Configuration → General settings →
   **Startup Command** = `node server.mjs` (of laat leeg als `npm start` automatisch pakt).

Daarna: push/merge naar `main` → de workflow draait `doctor`/`check`/`test` als gate en
deployt bij groen. Handmatig starten kan ook via **Actions → Deploy to Azure → Run workflow**.

## App-instellingen (App Service → Configuration → Application settings)

Optioneel, afhankelijk van wat je live wilt:

| Setting | Waarde / doel |
|---------|---------------|
| `AZURE_STORAGE_CONNECTION_STRING` | Table Storage voor assessment-resultaten (leeg = lokale JSON-store). |
| `HUB_BASE_URL`, `HUB_APP_TOKEN` | Alleen nodig voor de Vragenfabriek-hubkoppeling. |
| `ENTRA_TENANT_ID` / `ENTRA_CLIENT_ID` / `ENTRA_CLIENT_SECRET` | Entra SSO (App Service Authentication). |

Secrets horen **uitsluitend** in App Service-config of GitHub-secrets — nooit in de repo.

## Alternatief: OIDC (federated, geen langlevend secret)

Veiliger maar meer setup: maak een Entra app-registratie met een federated credential op
`repo:jippekecampai/assesment:environment:test`, geef die de rol *Website Contributor* op de
Web App, en vervang de deploy-stap door `azure/login@v2` (met `client-id`/`tenant-id`/
`subscription-id` als secrets) gevolgd door `azure/webapps-deploy@v3` zonder publish-profile.
Vraag hierom als jullie geen publish-profile-secrets willen gebruiken.
