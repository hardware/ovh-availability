ovh-availability v1.0.0
=======================

Application permettant de connaitre la disponibilité des serveurs d'OVH (SoYourStart, Kimsufi)

### Installation

```bash
git clone https://github.com/hardware/ovh-availability.git
npm install
bower update
migrate up
```

Ajouter les variables d'environnement dans un fichier nommé .env à la racine du projet :

```
ENV=development
SENDGRID_USERNAME=...
SENDGRID_PASSWORD=...
RECAPTCHA_PUBLIC_KEY=...
RECAPTCHA_PRIVATE_KEY=...
APP_URL=http://127.0.0.1:5000/
CRON_KEY=...
COOKIES_SECRET=...
SESSION_SECRET=...
OVH_API_URL=https://ws.ovh.com/dedicated/r2/ws.dispatcher/getAvailability2
```

### Lancement de l'application

```bash
foreman start
```

### Support

https://github.com/hardware/ovh-availability/issues

### License
MIT. Voir le fichier ``LICENCE`` pour plus de détails
