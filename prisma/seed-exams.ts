import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const examsData = [
  {
    certification: "PMP",
    title: "PMP - Project Management Professional",
    description: "Simulateur d'examen PMP couvrant les domaines de gestion de projet selon le PMBOK Guide",
    category: "Project Management",
    level: "Avance",
    duration: 30,
    numberOfQuestions: 10,
    passingScore: 65,
    questions: [
      { type: "SINGLE_CHOICE", text: "Quel est le principal objectif de la charte de projet ?", choices: [{ label: "A", text: "Definir le budget du projet" }, { label: "B", text: "Autoriser formellement le projet" }, { label: "C", text: "Identifier les parties prenantes" }, { label: "D", text: "Planifier les activites" }], correctAnswer: "B", explanation: "La charte de projet autorise formellement l'existence du projet et donne au chef de projet l'autorite d'utiliser les ressources", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Dans le cadre de la gestion des risques, qu'est-ce qu'un risque residuel ?", choices: [{ label: "A", text: "Un risque non identifie" }, { label: "B", text: "Un risque qui subsiste apres la mise en oeuvre des reponses" }, { label: "C", text: "Un risque secondaire" }, { label: "D", text: "Un risque positif" }], correctAnswer: "B", explanation: "Un risque residuel est celui qui reste apres avoir applique les strategies de reponse aux risques", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Quelle technique est utilisee pour estimer la duree d'une activite basee sur des projets similaires ?", choices: [{ label: "A", text: "Estimation par analogie" }, { label: "B", text: "Estimation parametrique" }, { label: "C", text: "Estimation a trois points" }, { label: "D", text: "Estimation ascendante" }], correctAnswer: "A", explanation: "L'estimation par analogie utilise les donnees historiques de projets similaires pour estimer", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quel est le role du sponsor du projet ?", choices: [{ label: "A", text: "Gerer les activites quotidiennes" }, { label: "B", text: "Fournir les ressources et le soutien au projet" }, { label: "C", text: "Executer les taches du projet" }, { label: "D", text: "Tester les livrables" }], correctAnswer: "B", explanation: "Le sponsor fournit les ressources financieres, resout les conflits escales et soutient le chef de projet", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Qu'est-ce que le chemin critique dans un projet ?", choices: [{ label: "A", text: "Le chemin le plus court du projet" }, { label: "B", text: "La sequence d'activites la plus longue determinant la duree minimale du projet" }, { label: "C", text: "Le chemin avec le plus de ressources" }, { label: "D", text: "Le chemin le plus couteux" }], correctAnswer: "B", explanation: "Le chemin critique est la plus longue sequence d'activites dependantes qui determine la duree totale du projet", difficulty: "medium" },
      { type: "TRUE_FALSE", text: "Le WBS (Work Breakdown Structure) decompose le travail du projet en elements plus petits et plus faciles a gerer.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "A", explanation: "Le WBS est une decomposition hierarchique du travail total a effectuer par l'equipe projet", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quelle est la formule de l'indice de performance des couts (CPI) ?", choices: [{ label: "A", text: "CPI = EV / AC" }, { label: "B", text: "CPI = AC / EV" }, { label: "C", text: "CPI = PV / AC" }, { label: "D", text: "CPI = EV / PV" }], correctAnswer: "A", explanation: "CPI = Earned Value / Actual Cost. Un CPI > 1 indique un projet en dessous du budget", difficulty: "hard" },
      { type: "SINGLE_CHOICE", text: "Quel processus appartient au groupe de processus de cloture ?", choices: [{ label: "A", text: "Valider le contenu" }, { label: "B", text: "Clore le projet ou la phase" }, { label: "C", text: "Maitriser le calendrier" }, { label: "D", text: "Gerer les communications" }], correctAnswer: "B", explanation: "Clore le projet ou la phase est le processus de finalisation de toutes les activites de tous les groupes de processus", difficulty: "medium" },
      { type: "MULTIPLE_CHOICE", text: "Quels sont des outils de gestion de la qualite ? (Selectionnez toutes les bonnes reponses)", choices: [{ label: "A", text: "Diagramme de Pareto" }, { label: "B", text: "Diagramme d'Ishikawa" }, { label: "C", text: "Diagramme de Gantt" }, { label: "D", text: "Histogramme" }], correctAnswer: "A,B,D", explanation: "Le diagramme de Pareto, d'Ishikawa et l'histogramme sont des outils qualite. Le Gantt est un outil de planification", difficulty: "hard" },
      { type: "SINGLE_CHOICE", text: "Quelle strategie de reponse aux risques negatifs consiste a eliminer completement la menace ?", choices: [{ label: "A", text: "Attenuer" }, { label: "B", text: "Transferer" }, { label: "C", text: "Eviter" }, { label: "D", text: "Accepter" }], correctAnswer: "C", explanation: "Eviter un risque signifie modifier le plan de projet pour eliminer completement la menace", difficulty: "medium" },
    ],
  },
  {
    certification: "CAPM",
    title: "CAPM - Certified Associate in Project Management",
    description: "Preparation a la certification CAPM pour les debutants en gestion de projet",
    category: "Project Management",
    level: "Debutant",
    duration: 20,
    numberOfQuestions: 8,
    passingScore: 60,
    questions: [
      { type: "SINGLE_CHOICE", text: "Combien de domaines de connaissance sont definis dans le PMBOK Guide ?", choices: [{ label: "A", text: "8" }, { label: "B", text: "10" }, { label: "C", text: "12" }, { label: "D", text: "5" }], correctAnswer: "B", explanation: "Le PMBOK Guide definit 10 domaines de connaissance en gestion de projet", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quel groupe de processus vient apres l'initiation ?", choices: [{ label: "A", text: "Execution" }, { label: "B", text: "Surveillance et maitrise" }, { label: "C", text: "Planification" }, { label: "D", text: "Cloture" }], correctAnswer: "C", explanation: "L'ordre est : Initiation, Planification, Execution, Surveillance et maitrise, Cloture", difficulty: "easy" },
      { type: "TRUE_FALSE", text: "Un projet est un effort temporaire entrepris pour creer un produit, service ou resultat unique.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "A", explanation: "C'est la definition exacte d'un projet selon le PMI", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Qui est responsable de la gestion quotidienne du projet ?", choices: [{ label: "A", text: "Le sponsor" }, { label: "B", text: "Le chef de projet" }, { label: "C", text: "Le client" }, { label: "D", text: "Le PMO" }], correctAnswer: "B", explanation: "Le chef de projet est responsable de la gestion quotidienne et de l'atteinte des objectifs", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Qu'est-ce qu'un livrable dans un projet ?", choices: [{ label: "A", text: "Un budget" }, { label: "B", text: "Un produit, resultat ou service mesurable et verifiable" }, { label: "C", text: "Un risque" }, { label: "D", text: "Une reunion" }], correctAnswer: "B", explanation: "Un livrable est tout produit, resultat ou capacite unique et verifiable qui doit etre produit pour achever un processus", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Le triangle de contraintes du projet inclut :", choices: [{ label: "A", text: "Cout, temps, qualite" }, { label: "B", text: "Risque, communication, approvisionnement" }, { label: "C", text: "Portee, calendrier, cout" }, { label: "D", text: "Equipe, sponsor, client" }], correctAnswer: "C", explanation: "Le triple contrainte traditionnel est : portee (scope), calendrier (schedule) et cout (cost)", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Qu'est-ce qu'une partie prenante (stakeholder) ?", choices: [{ label: "A", text: "Uniquement le client" }, { label: "B", text: "Toute personne ou organisation affectee par le projet" }, { label: "C", text: "Uniquement l'equipe projet" }, { label: "D", text: "Le sponsor" }], correctAnswer: "B", explanation: "Une partie prenante est tout individu, groupe ou organisation pouvant affecter ou etre affecte par le projet", difficulty: "easy" },
      { type: "TRUE_FALSE", text: "La planification est un processus qui se fait une seule fois au debut du projet.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "B", explanation: "La planification est iterative et se fait tout au long du projet (elaboration progressive)", difficulty: "medium" },
    ],
  },
  {
    certification: "PgMP",
    title: "PgMP - Program Management Professional",
    description: "Examen de simulation pour la gestion de programmes",
    category: "Program Management",
    level: "Expert",
    duration: 25,
    numberOfQuestions: 8,
    passingScore: 70,
    questions: [
      { type: "SINGLE_CHOICE", text: "Quelle est la difference principale entre un programme et un projet ?", choices: [{ label: "A", text: "Le budget" }, { label: "B", text: "Un programme est un groupe de projets geres de maniere coordonnee pour des benefices qu'on ne pourrait pas obtenir individuellement" }, { label: "C", text: "La duree" }, { label: "D", text: "Le nombre de personnes" }], correctAnswer: "B", explanation: "Un programme coordonne plusieurs projets pour obtenir des benefices strategiques", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Quel est le principal objectif de la gouvernance de programme ?", choices: [{ label: "A", text: "Reduire les couts" }, { label: "B", text: "Assurer l'alignement strategique et la livraison des benefices" }, { label: "C", text: "Gerer les risques" }, { label: "D", text: "Planifier les ressources" }], correctAnswer: "B", explanation: "La gouvernance de programme assure que le programme reste aligne avec la strategie organisationnelle", difficulty: "hard" },
      { type: "TRUE_FALSE", text: "Un programme a toujours une date de fin definie comme un projet.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "B", explanation: "Un programme peut etre continu tant qu'il delivre des benefices a l'organisation", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Qui est le responsable ultime du succes d'un programme ?", choices: [{ label: "A", text: "Le chef de projet" }, { label: "B", text: "Le directeur de programme" }, { label: "C", text: "Le sponsor du programme" }, { label: "D", text: "Le PMO" }], correctAnswer: "B", explanation: "Le directeur de programme est responsable de la coordination et du succes global du programme", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "La gestion des benefices dans un programme concerne :", choices: [{ label: "A", text: "Le calcul du ROI" }, { label: "B", text: "L'identification, la planification, la livraison et le maintien des benefices" }, { label: "C", text: "La gestion budgetaire" }, { label: "D", text: "La satisfaction client" }], correctAnswer: "B", explanation: "La gestion des benefices couvre tout le cycle de vie des benefices du programme", difficulty: "hard" },
      { type: "SINGLE_CHOICE", text: "Qu'est-ce qu'un composant de programme ?", choices: [{ label: "A", text: "Un budget" }, { label: "B", text: "Un projet, sous-programme ou activite connexe au sein du programme" }, { label: "C", text: "Un risque" }, { label: "D", text: "Un livrable" }], correctAnswer: "B", explanation: "Les composants d'un programme sont les projets, sous-programmes et activites qui le constituent", difficulty: "easy" },
      { type: "MULTIPLE_CHOICE", text: "Quels sont des domaines de performance de la gestion de programme ?", choices: [{ label: "A", text: "Alignement strategique" }, { label: "B", text: "Gestion des benefices" }, { label: "C", text: "Gestion de la qualite" }, { label: "D", text: "Engagement des parties prenantes" }], correctAnswer: "A,B,D", explanation: "L'alignement strategique, la gestion des benefices et l'engagement des parties prenantes sont des domaines cles", difficulty: "hard" },
      { type: "TRUE_FALSE", text: "Le directeur de programme doit avoir des competences en leadership et en pensee strategique.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "A", explanation: "Le leadership et la pensee strategique sont essentiels pour diriger un programme", difficulty: "easy" },
    ],
  },
  {
    certification: "RISK",
    title: "RISK - Risk Management Professional",
    description: "Examen de simulation en gestion des risques",
    category: "Risk Management",
    level: "Avance",
    duration: 25,
    numberOfQuestions: 8,
    passingScore: 65,
    questions: [
      { type: "SINGLE_CHOICE", text: "Quelle est la premiere etape du processus de gestion des risques ?", choices: [{ label: "A", text: "Analyse qualitative" }, { label: "B", text: "Identification des risques" }, { label: "C", text: "Planification de la gestion des risques" }, { label: "D", text: "Reponse aux risques" }], correctAnswer: "C", explanation: "La planification definit comment les activites de gestion des risques seront menees", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "La matrice de probabilite et d'impact est utilisee lors de :", choices: [{ label: "A", text: "L'identification des risques" }, { label: "B", text: "L'analyse qualitative des risques" }, { label: "C", text: "L'analyse quantitative des risques" }, { label: "D", text: "La planification des reponses" }], correctAnswer: "B", explanation: "La matrice probabilite/impact est un outil d'analyse qualitative pour prioriser les risques", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "La valeur monetaire attendue (EMV) se calcule par :", choices: [{ label: "A", text: "Probabilite + Impact" }, { label: "B", text: "Probabilite x Impact" }, { label: "C", text: "Impact / Probabilite" }, { label: "D", text: "Probabilite - Impact" }], correctAnswer: "B", explanation: "EMV = Probabilite x Impact monetaire. C'est utilise dans l'analyse quantitative", difficulty: "hard" },
      { type: "TRUE_FALSE", text: "Un risque peut etre aussi bien une menace qu'une opportunite.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "A", explanation: "Les risques positifs (opportunites) et negatifs (menaces) doivent etre geres", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quelle technique consiste a accepter un risque et a prevoir un budget de reserve ?", choices: [{ label: "A", text: "Evitement" }, { label: "B", text: "Transfert" }, { label: "C", text: "Acceptation active" }, { label: "D", text: "Attenuation" }], correctAnswer: "C", explanation: "L'acceptation active implique de constituer une reserve de contingence", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Le registre des risques contient :", choices: [{ label: "A", text: "Uniquement les risques negatifs" }, { label: "B", text: "Les risques identifies, leur analyse et les reponses planifiees" }, { label: "C", text: "Le budget du projet" }, { label: "D", text: "Le calendrier" }], correctAnswer: "B", explanation: "Le registre des risques est le document central contenant toutes les informations sur les risques", difficulty: "easy" },
      { type: "MULTIPLE_CHOICE", text: "Quelles sont des techniques d'identification des risques ?", choices: [{ label: "A", text: "Brainstorming" }, { label: "B", text: "Analyse SWOT" }, { label: "C", text: "Diagramme de Gantt" }, { label: "D", text: "Technique Delphi" }], correctAnswer: "A,B,D", explanation: "Le brainstorming, l'analyse SWOT et la technique Delphi sont des methodes d'identification des risques", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "La simulation Monte Carlo est utilisee dans :", choices: [{ label: "A", text: "L'identification des risques" }, { label: "B", text: "L'analyse qualitative" }, { label: "C", text: "L'analyse quantitative des risques" }, { label: "D", text: "La cloture du projet" }], correctAnswer: "C", explanation: "Monte Carlo est une technique de simulation utilisee dans l'analyse quantitative pour modeliser les incertitudes", difficulty: "hard" },
    ],
  },
  {
    certification: "AUDIT",
    title: "Audit & Control - Fundamentals",
    description: "Examen sur les fondamentaux de l'audit et du controle des projets",
    category: "Audit & Control",
    level: "Intermediaire",
    duration: 20,
    numberOfQuestions: 8,
    passingScore: 60,
    questions: [
      { type: "SINGLE_CHOICE", text: "Quel est l'objectif principal d'un audit de projet ?", choices: [{ label: "A", text: "Sanctionner l'equipe" }, { label: "B", text: "Evaluer la conformite et identifier les ameliorations" }, { label: "C", text: "Reduire le budget" }, { label: "D", text: "Accelerer le calendrier" }], correctAnswer: "B", explanation: "L'audit vise a evaluer la conformite aux standards et identifier les opportunites d'amelioration", difficulty: "easy" },
      { type: "TRUE_FALSE", text: "Un audit interne est conduit par une entite independante exterieure a l'organisation.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "B", explanation: "L'audit interne est conduit par des auditeurs au sein de l'organisation. L'audit externe est conduit par des entites independantes", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Qu'est-ce qu'un point de controle (control gate) dans un projet ?", choices: [{ label: "A", text: "Une reunion quotidienne" }, { label: "B", text: "Un point de decision formelle pour evaluer la progression avant de continuer" }, { label: "C", text: "Un test technique" }, { label: "D", text: "Une revue budgetaire" }], correctAnswer: "B", explanation: "Un point de controle est un jalon ou les decideurs evaluent si le projet doit continuer", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "La tracabilite des exigences permet de :", choices: [{ label: "A", text: "Reduire les couts" }, { label: "B", text: "S'assurer que chaque exigence est liee a un objectif et testable" }, { label: "C", text: "Accelerer le developpement" }, { label: "D", text: "Eliminer les risques" }], correctAnswer: "B", explanation: "La matrice de tracabilite assure que chaque exigence est justifiee, implementee et testee", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Quel document formalise les resultats d'un audit ?", choices: [{ label: "A", text: "Le plan de projet" }, { label: "B", text: "Le rapport d'audit" }, { label: "C", text: "Le registre des risques" }, { label: "D", text: "Le backlog" }], correctAnswer: "B", explanation: "Le rapport d'audit documente les constatations, conclusions et recommandations", difficulty: "easy" },
      { type: "MULTIPLE_CHOICE", text: "Quels elements sont generalement verifies lors d'un audit de projet ?", choices: [{ label: "A", text: "Respect des processus" }, { label: "B", text: "Qualite des livrables" }, { label: "C", text: "Couleur du logo" }, { label: "D", text: "Conformite reglementaire" }], correctAnswer: "A,B,D", explanation: "L'audit verifie les processus, la qualite et la conformite, pas les aspects esthetiques", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Le controle des changements a pour but de :", choices: [{ label: "A", text: "Bloquer tout changement" }, { label: "B", text: "Evaluer, approuver ou rejeter les modifications de maniere structuree" }, { label: "C", text: "Accelerer les modifications" }, { label: "D", text: "Eliminer la documentation" }], correctAnswer: "B", explanation: "Le controle des changements assure que les modifications sont evaluees et approuvees avant implementation", difficulty: "medium" },
      { type: "TRUE_FALSE", text: "Les actions correctives visent a corriger les ecarts par rapport au plan de projet.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "A", explanation: "Les actions correctives realisent la performance future attendue du projet en corrigeant les ecarts", difficulty: "easy" },
    ],
  },
  {
    certification: "GOOGLE",
    title: "Google Project Management Certificate",
    description: "Simulation d'examen basee sur le programme Google Project Management",
    category: "Project Management",
    level: "Debutant",
    duration: 20,
    numberOfQuestions: 8,
    passingScore: 60,
    questions: [
      { type: "SINGLE_CHOICE", text: "Quelle methodologie de gestion de projet est iterative et incrementale ?", choices: [{ label: "A", text: "Waterfall" }, { label: "B", text: "Agile" }, { label: "C", text: "PRINCE2" }, { label: "D", text: "Lean" }], correctAnswer: "B", explanation: "Agile est une approche iterative et incrementale qui s'adapte aux changements", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Dans Google Project Management, quel outil est recommande pour le suivi des taches ?", choices: [{ label: "A", text: "Microsoft Project" }, { label: "B", text: "Asana ou des feuilles de calcul" }, { label: "C", text: "AutoCAD" }, { label: "D", text: "Photoshop" }], correctAnswer: "B", explanation: "Google recommande des outils accessibles comme Asana, Trello ou Google Sheets", difficulty: "easy" },
      { type: "TRUE_FALSE", text: "La methodologie Waterfall permet des changements faciles a tout moment du projet.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "B", explanation: "Waterfall est sequentiel et les changements sont couteux une fois une phase terminee", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Qu'est-ce qu'un OKR (Objectives and Key Results) ?", choices: [{ label: "A", text: "Un outil budgetaire" }, { label: "B", text: "Un cadre de definition d'objectifs mesurables" }, { label: "C", text: "Un type de diagramme" }, { label: "D", text: "Un logiciel de gestion" }], correctAnswer: "B", explanation: "Les OKR definissent des objectifs ambitieux et des resultats cles mesurables pour suivre la progression", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Quelle est la premiere chose a faire lors du demarrage d'un projet ?", choices: [{ label: "A", text: "Commencer le developpement" }, { label: "B", text: "Definir les objectifs et les parties prenantes" }, { label: "C", text: "Embaucher l'equipe" }, { label: "D", text: "Creer le budget" }], correctAnswer: "B", explanation: "La definition des objectifs et l'identification des parties prenantes sont les premieres etapes", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Un retrospective en Agile sert a :", choices: [{ label: "A", text: "Planifier le sprint suivant" }, { label: "B", text: "Reflechir a ce qui a bien fonctionne et ce qui peut etre ameliore" }, { label: "C", text: "Presenter les livrables au client" }, { label: "D", text: "Estimer les couts" }], correctAnswer: "B", explanation: "La retrospective est un moment de reflexion collective pour l'amelioration continue", difficulty: "medium" },
      { type: "MULTIPLE_CHOICE", text: "Quelles sont des competences cles d'un chef de projet selon Google ?", choices: [{ label: "A", text: "Communication" }, { label: "B", text: "Organisation" }, { label: "C", text: "Programmation avancee" }, { label: "D", text: "Resolution de problemes" }], correctAnswer: "A,B,D", explanation: "Communication, organisation et resolution de problemes sont essentiels. La programmation n'est pas requise", difficulty: "easy" },
      { type: "TRUE_FALSE", text: "Un chef de projet doit toujours etre un expert technique du domaine du projet.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "B", explanation: "Un chef de projet gere les processus, le calendrier et l'equipe, pas necessairement l'expertise technique", difficulty: "easy" },
    ],
  },
  {
    certification: "ITIL",
    title: "ITIL 4 Foundation",
    description: "Simulation d'examen ITIL 4 Foundation sur la gestion des services IT",
    category: "IT Service Management",
    level: "Intermediaire",
    duration: 25,
    numberOfQuestions: 8,
    passingScore: 65,
    questions: [
      { type: "SINGLE_CHOICE", text: "Que signifie ITIL ?", choices: [{ label: "A", text: "International Technology Infrastructure Library" }, { label: "B", text: "Information Technology Infrastructure Library" }, { label: "C", text: "Integrated Technology Information Lifecycle" }, { label: "D", text: "Information Technical Integration Layer" }], correctAnswer: "B", explanation: "ITIL signifie Information Technology Infrastructure Library", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quel est le concept central d'ITIL 4 ?", choices: [{ label: "A", text: "Le processus" }, { label: "B", text: "La chaine de valeur des services (SVS)" }, { label: "C", text: "Le catalogue de services" }, { label: "D", text: "Le SLA" }], correctAnswer: "B", explanation: "Le Service Value System (SVS) est le concept central d'ITIL 4", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Combien de principes directeurs sont definis dans ITIL 4 ?", choices: [{ label: "A", text: "5" }, { label: "B", text: "7" }, { label: "C", text: "9" }, { label: "D", text: "4" }], correctAnswer: "B", explanation: "ITIL 4 definit 7 principes directeurs (guiding principles)", difficulty: "medium" },
      { type: "TRUE_FALSE", text: "Un service en ITIL est un moyen de delivrer de la valeur aux clients en facilitant les resultats souhaites.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "A", explanation: "C'est la definition ITIL d'un service : faciliter la co-creation de valeur", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quelle pratique ITIL gere les interruptions non planifiees de service ?", choices: [{ label: "A", text: "Problem Management" }, { label: "B", text: "Incident Management" }, { label: "C", text: "Change Enablement" }, { label: "D", text: "Service Request Management" }], correctAnswer: "B", explanation: "L'Incident Management restaure le fonctionnement normal du service le plus rapidement possible", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Quelle est la difference entre un incident et un probleme en ITIL ?", choices: [{ label: "A", text: "Aucune difference" }, { label: "B", text: "Un incident est une interruption, un probleme est la cause racine" }, { label: "C", text: "Un probleme est plus grave" }, { label: "D", text: "Un incident est planifie" }], correctAnswer: "B", explanation: "Un incident est un evenement impactant le service, un probleme est la cause sous-jacente d'un ou plusieurs incidents", difficulty: "medium" },
      { type: "MULTIPLE_CHOICE", text: "Quels sont des principes directeurs ITIL 4 ?", choices: [{ label: "A", text: "Focus on value" }, { label: "B", text: "Start where you are" }, { label: "C", text: "Maximize profit" }, { label: "D", text: "Keep it simple and practical" }], correctAnswer: "A,B,D", explanation: "Focus on value, Start where you are et Keep it simple sont des principes ITIL 4. Maximize profit n'en est pas un", difficulty: "hard" },
      { type: "SINGLE_CHOICE", text: "Le CMDB (Configuration Management Database) stocke :", choices: [{ label: "A", text: "Les mots de passe" }, { label: "B", text: "Les informations sur les elements de configuration et leurs relations" }, { label: "C", text: "Les tickets d'incident" }, { label: "D", text: "Les contrats fournisseurs" }], correctAnswer: "B", explanation: "Le CMDB contient les informations sur les CI (Configuration Items) et leurs relations", difficulty: "medium" },
    ],
  },
  {
    certification: "SCRUM",
    title: "SCRUM Master Certification",
    description: "Simulation d'examen Scrum Master sur le framework Scrum",
    category: "Agile",
    level: "Intermediaire",
    duration: 20,
    numberOfQuestions: 8,
    passingScore: 65,
    questions: [
      { type: "SINGLE_CHOICE", text: "Quelle est la duree recommandee d'un Sprint en Scrum ?", choices: [{ label: "A", text: "1 mois maximum" }, { label: "B", text: "3 mois" }, { label: "C", text: "6 mois" }, { label: "D", text: "1 semaine exactement" }], correctAnswer: "A", explanation: "Un Sprint dure entre 1 et 4 semaines, avec un maximum d'un mois", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Qui est responsable de maximiser la valeur du produit ?", choices: [{ label: "A", text: "Le Scrum Master" }, { label: "B", text: "Le Product Owner" }, { label: "C", text: "L'equipe de developpement" }, { label: "D", text: "Le manager" }], correctAnswer: "B", explanation: "Le Product Owner est responsable de maximiser la valeur du produit et de gerer le Product Backlog", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quel est le role principal du Scrum Master ?", choices: [{ label: "A", text: "Gerer l'equipe" }, { label: "B", text: "Ecrire le code" }, { label: "C", text: "Faciliter le processus Scrum et supprimer les obstacles" }, { label: "D", text: "Definir les exigences" }], correctAnswer: "C", explanation: "Le Scrum Master est un servant-leader qui facilite Scrum et aide a supprimer les impediments", difficulty: "easy" },
      { type: "TRUE_FALSE", text: "Le Daily Scrum doit durer exactement 15 minutes.", choices: [{ label: "A", text: "Vrai" }, { label: "B", text: "Faux" }], correctAnswer: "A", explanation: "Le Daily Scrum est un evenement timeboxe de 15 minutes pour l'equipe de developpement", difficulty: "easy" },
      { type: "SINGLE_CHOICE", text: "Quels sont les trois piliers de Scrum ?", choices: [{ label: "A", text: "Planification, execution, cloture" }, { label: "B", text: "Transparence, inspection, adaptation" }, { label: "C", text: "Vitesse, qualite, cout" }, { label: "D", text: "Communication, collaboration, confiance" }], correctAnswer: "B", explanation: "Les trois piliers empiriques de Scrum sont : transparence, inspection et adaptation", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Qu'est-ce que la Definition of Done (DoD) ?", choices: [{ label: "A", text: "La date de fin du sprint" }, { label: "B", text: "Un ensemble de criteres que chaque increment doit satisfaire pour etre considere comme termine" }, { label: "C", text: "La liste des taches du sprint" }, { label: "D", text: "Le budget restant" }], correctAnswer: "B", explanation: "La DoD est un accord formel sur les criteres de qualite pour chaque increment", difficulty: "medium" },
      { type: "MULTIPLE_CHOICE", text: "Quels sont des evenements Scrum ?", choices: [{ label: "A", text: "Sprint Planning" }, { label: "B", text: "Sprint Review" }, { label: "C", text: "Weekly Status Meeting" }, { label: "D", text: "Sprint Retrospective" }], correctAnswer: "A,B,D", explanation: "Sprint Planning, Sprint Review et Sprint Retrospective sont des evenements Scrum. Le Weekly Status Meeting n'en est pas un", difficulty: "medium" },
      { type: "SINGLE_CHOICE", text: "Qui peut annuler un Sprint ?", choices: [{ label: "A", text: "Le Scrum Master" }, { label: "B", text: "L'equipe de developpement" }, { label: "C", text: "Le Product Owner" }, { label: "D", text: "Le stakeholder" }], correctAnswer: "C", explanation: "Seul le Product Owner a l'autorite d'annuler un Sprint si l'objectif devient obsolete", difficulty: "hard" },
    ],
  },
];

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) {
    console.error("Aucun admin trouve. Lancez d'abord npm run db:seed");
    return;
  }

  for (const examData of examsData) {
    // Check if exam already exists
    const existing = await prisma.exam.findFirst({
      where: { title: examData.title },
    });

    if (existing) {
      console.log(`Examen "${examData.title}" existe deja, ignore.`);
      continue;
    }

    const exam = await prisma.exam.create({
      data: {
        title: examData.title,
        description: examData.description,
        certification: examData.certification,
        category: examData.category,
        level: examData.level,
        duration: examData.duration,
        numberOfQuestions: examData.numberOfQuestions,
        randomOrder: true,
        published: true,
        status: "READY",
        passingScore: examData.passingScore,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        createdById: admin.id,
      },
    });

    for (let i = 0; i < examData.questions.length; i++) {
      const q = examData.questions[i];
      await prisma.question.create({
        data: {
          examId: exam.id,
          type: q.type as "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE" | "SHORT_ANSWER" | "OPEN_ENDED",
          text: q.text,
          choices: q.choices || undefined,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          orderIndex: i,
          points: 1,
        },
      });
    }

    console.log(`Examen cree: "${examData.title}" (${examData.certification}) - ${examData.questions.length} questions`);
  }

  console.log("\nTous les examens sont charges !");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
