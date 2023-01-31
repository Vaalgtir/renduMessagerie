# node-Messagerie

http://57.128.91.231:3000/

## Installation et Seeding de la DB

Vous ne pourrez pas installer le projet car il possède des .env sensible, notamment une clé API vers mon système de mailing. Il ne sera donc pas partagé.

- installer les modules dans /app et /api avec `yarn install`
- faire un `docker-compose up --build -d`
- Pour Seeder la base de donnée: cela n'est pas nécessaire car est aussi fourni un script d'initialisation de la bdd dans /bdd/DB_Script/bdd.sql. Si toutefois vous vouliez voir un script de seed, éxecuter `npx prisma db seed` => Vous pouvez voir le schéma de la base de donnée dans /api/prisma/schema.prisma.

## POUR TESTER LE PROJET

Vous avez à votre disposition un site internet renseigné en haut de cet notice.

2 utilisateurs sont déjà fournis : salesman@gmail.com et customer@gmail.com, leur mot de passe étant pour les 2 : "khunou"
salesman@gmail.com est un administrateur et un vendeur, il peut donc accepter les demandes de discussions via sa page d'accueil.
customer@gmail.com est un utilisateur lambda dont le mail a été validé

## Liste des fonctionnalités

### Hébergement

Afin de se rapproché le plus possible d'une logique d'entreprise, le projet est hébergé sur le Cloud d'OVH via un cluster Kubernetes scalable en fonction de la charge. Les fichiers de configs se trouvent dans le répertoir /kubernetes.

### Sécurité

- L'application a été entièrement sécurisée au niveau de ses routes authentifées avec les middleware d'authentification au niveau de l'API qui détermine aussi le niveau de droit d'un utilisateur, par exemple pour les routes réservées aux administrateurs `authAdmin`.
- Il a aussi été mis un système avancé de vérification de Token à chaque rechargement de Page.
- les créations de comptes sont sécurisées avec un système de confirmation de mail qui donne accès à l'application lorsque le mail est validé
- En mode administrateur, il y'a une gestion de tous les users de la plateforme, pour les bannir, les faire changer de rôle etc

### Attendus

- dans Home.tsx
  - Il est possible de demander à communiquer avec un conseiller de vente
  - En cas de conseiller non-disponible, il n’est pas possible de demander à communiquer avec un conseiller de vente
  - Il est possible de voir les demandes de communication en attente
  - Il est possible de refuser une demande de communication
  - Il est possible d’accepter une demande de communication
- dans /Messagerie
  - Il est possible de communiquer avec les autres clients
  - d'ajouter des clients en amis et de report des messages
- dans Reunions.tsx
  - Il est possible de rejoindre des salons de discussions prédéfinis par un administrateur
  - Il n’est pas possible de rejoindre un salon de discussion complet
  - Il n’est pas possible de communiquer sur un salon de discussion supprimé
  - Il est possible de créer un salon de discussion
  - Il est possible de modifier le nom d’un salon de discussion
  - Il est possible de modifier le volume d'utilisateurs d’un salon de discussion
  - Il est possible de supprimer un salon de discussion
- dans Push.tsx et App.tsx pour la réception et affichage des flags
  - Il est possible de recevoir des notifications commerciales d’un administrateur
  - Il est possible d'émettre des notifications commerciale
