# CarePass smart contract

`CarePassRegistry.sol` je on-chain dokazni registar za CarePass. Ne čuva PDF-ove — samo heš dokumenta, vrstu, izdavaoca i status verifikacije, po ugledu na tok opisan u master radu. Svaka nova verzija dokumenta dodaje se kao novi zapis, stara verzija ostaje u istoriji.

## Priprema (jednom)

1. Instaliraj zavisnosti:
   ```bash
   cd contracts
   npm install
   ```
2. Napravi `.env` na osnovu `.env.example`:
   ```bash
   cp .env.example .env
   ```
3. Popuni `.env`:
   - `SEPOLIA_RPC_URL` — besplatan RPC endpoint sa [Alchemy](https://www.alchemy.com/) ili [Infura](https://www.infura.io/) (napravi projekat, izaberi Sepolia mrežu, kopiraj URL).
   - `PRIVATE_KEY` — privatni ključ **test novčanika** (npr. napravi poseban MetaMask nalog samo za ovaj demo). **Nikad ne stavljaj ovde ključ novčanika sa pravim sredstvima.**
   - Test ETH za taj novčanik uzmi sa nekog Sepolia faucet-a (npr. [sepoliafaucet.com](https://sepoliafaucet.com/) ili Alchemy-jev faucet).

## Provera pre deploya

```bash
npm run compile
npm test
```

Test fajl (`test/CarePassRegistry.js`) pokriva registraciju, autorizaciju institucije, verzionisanje i pristupnu kontrolu — sve prolazi lokalno bez ijednog dolara/testnet ETH-a.

## Deploy na Sepolia

```bash
npm run deploy:sepolia
```

Ispisaće adresu deployovanog ugovora, npr:

```
CarePassRegistry deployed to: 0xABCD...
```

1. Kopiraj tu adresu u `carepass-frontend/.env`:
   ```
   VITE_CONTRACT_ADDRESS=0xABCD...
   ```
2. Restartuj frontend dev server (`npm run dev` u `carepass-frontend/`) da pokupi novu env varijablu.

## Autorizacija institucije

Samo novčanici koje vlasnik ugovora eksplicitno autorizuje mogu da pozovu `recordVerificationStatus` (Prihvati/Traži dopunu/Odbij). Za demo:

1. U browseru, uloguj se kao institucija (`fakultet@carepass.rs`) i klikni "Poveži novčanik" u headeru — zapamti tu MetaMask adresu.
2. U `contracts/.env` dodaj `CONTRACT_ADDRESS=0xABCD...` (adresa iz prethodnog koraka).
3. Autorizuj tu adresu:
   ```bash
   INSTITUTION_ADDRESS=0xInstitucijaWalletAdresa npm run authorize:sepolia
   ```

Nakon ovoga, kad institucija u aplikaciji potvrdi/odbije/zatraži dopunu dokumenta, transakcija se stvarno šalje na Sepolia i može se pogledati na [sepolia.etherscan.io](https://sepolia.etherscan.io/).

## Napomena o modelu

- Aplikacija radi i bez deployovanog ugovora (`VITE_CONTRACT_ADDRESS` prazno) — tada `contractService.js` vraća demo podatke, ništa se ne šalje na MetaMask.
- Deljenje dokumenata (grant/revoke pristupa) namerno ostaje van lanca — spec iz master rada kaže da se on-chain upisuje samo heš/tip/izdavalac/datum/status, ne i kome je nešto deljeno.
- Kandidat koji prvi put registruje kredencijal (`registerCredential`) postaje njegov "vlasnik" na ugovoru (`credentialOwner`) — samo isti novčanik može dodavati nove verzije tog kredencijala. Za demo je najjednostavnije da svaki test-kandidat koristi svoj MetaMask novčanik dosledno.
