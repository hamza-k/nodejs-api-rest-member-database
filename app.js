require('babel-register')
const express = require('express')
const morgan = require('morgan')('dev')
const config = require('./assets/config')
const mysql = require('promise-mysql')
//const expressOasGenerator = require('express-oas-generator') => désinstallé
const {returnResult} = require('./assets/functions')

const app = express()
const swaggerUi = require('swagger-ui-express')
const swaggerDoc = require('./assets/swagger.json')
app.use(config.rootAPI + 'api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc))
// expressOasGenerator.init(app, {}) // to overwrite generated specification's values use second argument. => désinstallé

mysql.createConnection(config.connectionDB).then((db) => {
  console.info('Connected !')
  const bodyParser = require('body-parser')

  let MembersRouter = express.Router()
  let Members = require('./assets/classes/members-class')(db, config)

  app.use(morgan)
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  MembersRouter.route('/:id')

      // Recuperer un membre ayant un ID précis - CHECKED
      .get(async (req, res) => {

          let member = await Members.getByID(req.params.id)
          res.json( returnResult(member) )

      })

      // Modifier un membre ayant un ID précis - CHECKED
      .put(async (req, res) => {

        let member = await Members.editMember(req.params.id, req.body.name)
        res.json( returnResult(member) )

      })

      // Supprimer un membre ayant un ID précis -CHECKED
      .delete(async (req, res) => {
        let member = await Members.deleteMember(req.params.id)
        res.json(returnResult(member))
      })

  MembersRouter.route('/')

      // Récuperer tous les membres - CHECKED

      .get(async (req, res) => {

        let member = await Members.getAll(req.query.max)
        res.json( returnResult(member) )

      })

      // Ajouter un membre - CHECKED
      .post(async (req, res) => {

        let member = await Members.addMember(req.body.name)
        res.json( returnResult(member) )
      })

    app.use(`${config.rootAPI}members`, MembersRouter)
    app.listen(config.port, () => console.info(`Started on port ${config.port}`))
}).catch((err) => {
  console.error('Error connecting: ' + err.message)
})

// CREATION D'UNE DOCUMENTATION - Deux outils
//
// ------- Swagger (outil de documentation interne car nous le faisons depuis notre IDE)
// On peut l'installer grace à son npm express-oas-generator, pour ensuite appeler le module (juste après celui d'Express !)
// Il faudra aussi l'instancier juste après l'instance d'Express
// => Ceci va générer une page HTML qui documentera notre API REST de manière "prémaché", 
//    avec un lien qui nous permet d'acceder à un fichier JSON explicatif de l'arborescence des routes
//    ==> C'est ce fichier qui nous intéresse... Prenons le ! Et stockons le dans le dossier assets sous le nom de swagger.json
// Ainsi, nous n'avons plus besoin de express-oas-generator, on le désinstalle
// => Car nous avons fait la génération de ce qui pourrait nous servir de documentation (le fichier json)
// Juste après, nous installons swagger-ui-express, et nous appelons le module, puis l'instance, toujours après ceux de Express
// Résultat => Le même que quand nous avons installé express-oas-generator, mais avec moins de fichier, un URL personnalisé
// ---Explication du fichier swagger.json
// => Comme c'est un fichier json, la structure de données est donc facile à exploité, assez pour modifier nos données rapidement, comme le titre et les infos
//    basePath et host ont été ajouté car ils font parti des propriétés de swagger.json
//    Il en va de même pour l'objet tags, qui regroupe les tags de la documentation (il n'y a que default mais ajoutons members)
//    Et donc pour chacun de nos méthodes, nous pouvons leurs attribuer nos tags (sous forme d'array)
//    Nous ajoutons aussi des paramètres à la méthode POST (car il en a, mais il n'est pas ajouté dans Swagger) ainsi que pour le GET members (car il peut avoir un max)
// Pour approfondir le swagger.json, voir la documentation sur swagger.io
//
// ------- Gitbook (outil de documentation externe car nous le faisons sur internet)
// L'avantage, est que c'est plus centré sur le partage et l'historique (à la manière de Git)
// Il faudra se rentre dans le site de gitbook.com et avoir son compte (possible de l'avoir avec Github)