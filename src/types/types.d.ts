type taskId = string
type questId = string
type actorTemplateId = string
type actorId = string
type actorInstanceId = string
type actorGroupId = string
type dialogId = string
type dialogLineId = string
type journalEntryId = string
type regionId = string
type locationId = string
type regionMapId = string
type locationMapId = string
type markerId = string
type roadId = string
type dungeonMapId = string
type levelId = string
type unitId = string
type effectId = string
type zoneId = string
type spawnId = string
type npcPartyId = string
type landResourceId = string

interface Task {
  id: taskId;
  name: string;
  questId: questId;
  /**
   * Work end up as subscriptions to proper state transition on
   * entity they concern (e.g. expectation to win in battle encounter).
   */
  successConditions: Work[];
  /**
   * Effect is some immediate result of fulfilling work (e.g. granting currency).
   */
  onSuccess: effectId[];
  /**
   * Certain states which will result in player failing the task and the quest.
   */
  failureConditions: Work[];
  onFailure: effectId[];
  /**
   * Becomes active when previous task is done. Active task generates
   * subscriptions according to work.
   */
  active: boolean;
  done: boolean;
  failed: boolean;
  /**
   * First task is one that is hidden and is meant to decide
   * if the actual quest should begin.
   * For this reason it will almost always be hidden to the player.
   * First task will generate subscriptions just as the game world is booted.
   */
  isFirstTask: boolean;
  /**
   * Last task, when done, marks entire quest as done also.
   */
  isLastTask: boolean;
  formerTask: taskId | null;
  nextTasks: taskId[] | null; // most of the times there will be just one next task
}

/**
 * Quest is just a wrapper for tasks which are *the* meat and potatoes
 * of the quest-system.
 */
interface Quest {
  id: questId;
  name: string;
  firstTask: taskId;
  /**
   * is active when is neither done nor failed nor obsolete
   */
  active: boolean;
  done: boolean;
  failed: boolean;
  /**
   * Obsolete quest is one that from world-consistency standpoint
   * has no longer reason to exist.
   */
  obsolete: boolean;
  dialog: dialogId;
}

interface Work {
  id: workId;
  workType: WorkType;
  payload?: {
    entityId?: string
    workParams: unknown;
  }
}

enum WorkType {
  WinBattle = 'WinBattle', // 'Win battle',
  LoseBattle = 'LoseBattle', // 'Lose battle',
  SelectDialog = 'SelectDialog', // 'Select dialog',
  VisitRegion = 'VisitRegion', // 'Visit region',
  VisitLocation = 'VisitLocation', // 'Visit location',
  VisitMarker = 'VisitMarker', // 'Visit marker',
  ObtainItem = 'ObtainItem', // 'Obtain item',
  InteractWith = 'InteractWith', // 'Interact with object',
  Custom = 'Custom', // 'Custom work'
}

/**
 * Effects are fundamental building blocks of any change
 * in the game world.
 * Any action that player can take to alter the game world state
 * ends-up with an effect.
 */

interface Effect {
  name: string;
  id: effectId;
  target?: actorInstanceId | AreaOfEffect;
  payload: {
    data: unknown;
  }
}

interface GameWorldEffect extends Effect {
  effectType: NonCombatEffectType | CombatEffectType | ComplexEffectType
}

interface SystemEffect extends Effect {
  effectType: SystemEffectType,
}

interface ComplexEffect extends Effect {
  effects: effectId[]
}

enum EffectType {
  GrantExperience = 'GrantExperience', // 'Grant experience points',
  GrantCurrency = 'GrantCurrency', // 'Grant currency',
  RemoveCurrency = 'RemoveCurrency', // 'Remove currency',
  GrantLoot = 'GrantLoot', // 'Grant loot',

  EnableDialog = 'EnableDialog', // 'Enable dialog',
  DisableDialog = 'DisableDialog', // 'Disable dialog',

  AddMember = 'AddMember', // 'Add member to the party',
  RemoveMember = 'RemoveMember', // 'Remove member from the party',

  UncoverLocation = 'UncoverLocation', // 'Uncover location',
  UncoverRegion = 'UncoverRegion', // 'Uncover location',

  GrantSkillPoints = 'GrantSkillPoints', // 'Grant skill points',
  RemoveSkillPoints = 'RemoveSkillPoints', // 'Remove skill points',
  GrantAbility = 'GrantAbility', // 'Grant ability',
  RemoveAbility = 'RemoveAbility', // 'Remove ability',

  GrantItem = 'GrantItem', // 'Grant item',
  RemoveItem = 'RemoveItem', // 'Remove item',
  RepairItem = 'RepairItem', // 'Repair item',
  ModifyItem = 'EnhanceItem',
  CraftItem = 'CraftItem',
  DestroyItem = 'DestroyItem',
  UseItem = 'UseItem',

  CompleteTask = 'CompleteTask', // 'Activate task',
  ActivateTask = 'ActivateTask', // 'Activate task',

  CompleteQuest = 'CompleteQuest', // 'Complete quest',
  FailQuest = 'FailQuest', // 'Fail quest',

  AddJournalEntry = 'AddJournalEntry', // 'Add journal entry',

  MoveToCoordinates = 'TravelToCoordinates', // 'Travel to coordinates on the road',
  MoveToMarker = 'MoveToMarker', // 'Travel to map marker',

  TravelToCoordinates = 'TravelToCoordinates', // 'Travel to coordinates on the road',
  TravelToMarker = 'TravelToMarker', // 'Travel to map marker',

  RunScript = 'RunScript', // 'Run script',
}

/**
 * Various combat effect.
 * This is going to be very big section.
 * It will be developed further when working on skills
 * and combat more in detail.
 */
enum CombatEffectType {
  Attack,
  Pierce,
  Slash,
  Bludgeon,

  GrantActionPoint,
  RemoveActionPoint,

  Evade, // Avoid attack by whole body movement
  Block, // Stop or deflect incoming attack with a shield or weapon
  DefensiveStance,

  Bash, // Attack with shield
  Batter, // Ram into enemy with your body mass to move him

  Dash, // You can make some 'intense' actions with higher stamina cost doing more in a
  // single turn for a cost of exhaustion later on
  Jump, // Allows going past some obstacles

  Wound,
  HealWound,
  MendWound, // Mended wound is closed for X turns
  DamageStamina, // Various attack and statuses damage stamina
  DamageHealth, // Wounds damage health

  ApplyBruise,
  ApplyPoison,
  ApplyDisease,
  ApplyBurn,
  Freeze,
  ApplyFrostbite,
  ApplyHeat, // Debilitating heat
  ApplyCold, // Debilitating cold
  ApplyStench, //
  Curse,
  Infect,

  Stun,
  Cripple,
  Entange,
  Shock,
  Intimidate,
  Slow,
  Daze,

  UseItem,

  Enrage,
  Refresh,
  Rest,
  Encourage,
  Desensitize,
  Haste,
  Focus,
  Concentrate,
  Strengthen,
  Exhaust,
}

enum CombatStatusEffectType {
  Burnt,
  Burning,
  Frozen,
  Frostbitten,
  Stunned,
  Crippled,
  Entangled,
  Poisoned,
  Shocked,
  Freightened,
  Slowed,
  Infected,

  Curageous,
  Strengthened,
  Refreshed,
  Focused,
  Hastened,

  Desensitized,
  Concentrated
}

enum SystemEffectType {
  NewGame = 'NewGame',
  SaveGame = 'SaveGame',
  LoadGame = 'LoadGame',
  ExitToSystem = 'ExitToSystem',
  ExitToTitleScreen = 'ExitToTitleScreen',
}

enum ComplexEffectType {
  ComplexEffect = 'ComplexEffect'
}

interface AreaOfEffect {}

/* Journal */

/**
 * Journal keeps quest-related entires.
 * Entries are created as effects of tasks.
 */
interface Journal {
  activeQuests: {
    [questId: string]: Array<JournalEntry> // later filtered by date for display
  };
  completedQests: {
    [questId: string]: Array<JournalEntry>
  };
  failedQuests: {
    [questId: string]: Array<JournalEntry>
  };
}

interface JournalEntry {
  id: journalEntryId;
  questId: questId;
  entryDate: string;
}

/* Conversations */

/**
 * Conversations keep record of lines exchanged with NPCs
 * in order of their appearance.
 * No duplicates.
 */

interface Conversations {
  [actorId: string]: Array<ConversationEntry>
}

interface ConversationEntry {
  id: conversationEntryId;
  actorId: actorId;
  dialogLine: DialogLine;
  entryDate: string;
}

/* Bestiary */

/* Notes about locations and regions */

/* Notes about people */

/* Dialogs */

interface DialogGroup {
  name: string;
  id: dialogGroupId;
  type: DialogType;
  /**
   * For dialog characteristic to given location
   */
  location?: locationId;
}

interface Dialog {
  id: dialogId;
  type: DialogType;
  group: dialogGroupId;
  /**
   * Allowed dialog is one that user is allowed to see.
   */
  allowed: boolean;
  /**
   * Active dialog is currently displayed.
   */
  active: boolean;
  /**
   * It's meant to disallow certain conversations as a result
   * of story-related developments.
   * Be careful about disabling shared dialog.
   */
  disabled: boolean;
  dirty: boolean;
  /**
   * Private dialogs are ment for only a single actor.
   * Non-private dialog is by definition shared or common,
   * and will be used by many actors.
   */
  isPrivate: boolean;
  /**
   * Priority - single trumps group, e.g.:
   * G1 = [A1, A21], G2 = [A21, A22]
   * + G1 - G2 + A22 => [A1, A22]
   * + G1 - A21 => [A1]
   */
  actorsExcluded?: actorId[];
  groupsExcluded?: actorGroupId[];
  actorsIncluded?: actorId[];
  groupsIncluded?: actorGroupId[];
  /* Linked list */
  startDialogLine: dialogLineId;
}

enum DialogType {
  Welcome = 'WelcomeDialog',
  Banter = 'BanterDialog',
  Job = 'JobDialog',
  Pastime = 'PastimeDialog',
  Quest = 'QuestDialog',
  Wtf = 'WtfDialog',
  Mixed = 'Mixed',
}

interface DialogLine {
  id: dialogLineId;
  dialogId: dialogId;
  actor: actorInstanceId;
  content: string;
  formerDialogLine: dialogLineId;
  nextDialogLines: dialogLineId[];
  effects: effectId[];
  emotion: EmotionType;
  /**
   * option number allows manual control of dialog options ordering.
   */
  optionNumber?: number;
}

enum EmotionType {
  Happy = 'Happy',
  Angry = 'Angry',
  Neutral = 'Neutral',
  Anxious = 'Anxious',
  Terrified = 'Terrified',
  Worried = 'Worried',
  Shocked = 'Shocked',
  Bitter = 'Bitter',
  Sarcastic = 'Sarcastic',
}

function Prompter(actorInstanceId: actorId): DialogOptions

/* Actors */

interface ActorGroup {
  name: string;
  id: actorGroupId;
  actors: Array<actorId>;
}

interface ActorTemplate {
  name: string;
  id: actorTemplateId;
  parameters: unknown;
}

/**
 * Actor created from the template and then
 * customized for direct in-game use.
 * Each actor is unique.
 *
 * If situation requires random instances
 * then proper Template can be created and used for ad-hoc
 * Actor creation and Instantiation.
 * But it will be more resource intensive.
 */
interface Actor {
  name: string;
  id: actorId;
  group: actorGroupId;
  type: ActorType;
  home: interiorId | zoneId;
  faction: factionId;
  /**
   * information related to graphics and sounds.
   */
  data: unknown;
  group?: actorGroupId;
  attributes: ActorAttributes;
  traits: ActorTraits;
  abilities: ActorAbilities;
  skills?: ActorSkills;

  // occupation: unknown;
  // ... ?
}

interface ActorTypeSymbol {}

interface ActorAttributes {}

interface ActorTraits {}

interface ActorAbilities {}

interface ActorSkills {}

/**
 * PlayerCharacter and party actors instances
 * are the only actors that are modified throughout
 * the game.
 */
interface PlayerCharacter extends Actor {
  actorInstanceId: '0';
}

/**
 * ActorInstance is Actor with additional
 * data required to show it in 3D scene other
 * than map.
 */
interface ActorSceneInstance extends Actor {
  data: unknown;
  combatStatus?: ActorCombatStatus;
}

enum ActorType {
  Player = 'Player',
  Unknown = 'Unknown',
  Merchant,
  Soldier,
  Beast,
  Animal,
}

interface Party {
  name: string;
  id: partyId;
  hostile: boolean;
  composition: Array<ActorType>
  actors: Array<actorInstanceId>;
}

interface PlayerParty extends Party {
  id: '0';
  actors: Array<actorInstanceId>;
}

interface NpcParty {
  name: string;
  id: npcPartyId;
  hostile: boolean;
  type: PartyType;
  actors: Array<actorId>;
}

/**
 * Player reputation
 */
interface Reputation {}

/**
 * Individual disposition of NPCs
 */
interface Disposition {}

/*  */

/**
 * Schedule.
 *
 * Scheduling is simple.
 *
 * Sleep always takes precedence and always *is* in the
 * schedule.
 *
 * Every actor has one job.
 *
 * Every actor has some pastime activities which
 * he choses based on time available, activities
 * available and their current popularity.
 *
 * This could be made far more complex and dynamic but
 * for the sake of not rabbit-holing myself I keep it simple.
 */
interface Schedule {
  id: scheduleId;
  job: jobId | patrolDutyId | travelJobId;
  workingHours: {
    from: number;
    to: number;
  };
  sleepHours: {
    from: number;
    to: number;
  };
  vacationDays: Array<WeekDayType>;
  pastimePreference: Array<pastimeId>;
}

interface Activity {
  name: string;
  type: ActivityType;
  behaviour: WorldMapBehaviour | LevelBehaviour;
  dialog: dialogId | dialogGroupId;
}

interface Rule {
  checker: unknown;
  effect: effectId;
}

interface StateMachine {
  [stateCase: string]: Rule;
}

interface WorldMapBehaviour {
  id: worldMapbehaviourId;
  brain: StateMachine;
}

interface LevelBehaviour {
  id: levelBehaviourId;
  brain: StateMachine;
}

interface Job extends Activity {
  id: jobId;
  site: interiorId | zoneId;
}

interface PatrolDuty extends Activity {
  id: patrolDutyId;
  site: zoneId;
}

interface TravelJob {
  id: travelJobId;
  routes: Array<Route>;
}

interface Pastime extends Activity {
  id: pastimeId;
  startTime: number;
  endTime: number;
  site: interiorId | zoneId;
}

enum WeekDayType {
  Monday = 'Monday',
  Tuesday = 'Tuesday',
  Wednesday = 'Wednesday',
  Thursday = 'Thursday',
  Friday = 'Friday',
  Sunday = 'Sunday',
}

interface Route {
  name: string;
  id: routeId;
  route: Array<TravelCheckpointMarker>;
}

interface TravelCheckpointMarker extends Marker {
  id: travelMarkerId;
  hidden: true;
  parentRoute: routeId;
  onArrival: activityId;
}

enum ActivityType {

}

/*  */

interface Item {
  obj3D: any;
  // ...
}

enum ItemType {

}

/*  */

/**
 * World is a base container for everything that player interacts with.
 * Game needs at least 1 world.
 */
interface World {
  name: string;
  id: worldId;
  locations: Array<locationId>;
  markers: Array<LocationMarker | PartyMarker>;
  level: WorldLevel;
}

/**
 * World is presented as a 3D level that looks like a map.
 * It's camera is always looking straight down so it seems largely flat and 2D.
 *
 * Since world is a kind of location that is itself presented as a map,
 * it doesn't have map of it's own.
 */
interface WorldLevel {
  id: levelId;
  data: unknown;
}

/**
 * Region is fragment of the world.
 * Maps that player can buy pertain to regions.
 *
 * Obtaining a map discloses all features of the region (except hidden ones).
 *
 * Region exists only to provide player with more contextual (political, geographic...)
 * information about various areas of the world by being able
 * to divide world map into such.
 */
interface Region {
  name: string;
  id: regionId;
  locations: Array<locationId>;
  data: unknown; // bitmap?
}

/* World Level features */

/**
 * It represents real road on which entities on the map
 * can move.
 *
 * Most likely it's some kind of bit format that should be
 * possible to interpret both on JS side and Unreal side.
 * It should also be editable on both ends.
 *
 * It would be perfect if Maker could scan roads drawn
 * on maps and turn them into meaningful data.
 *
 * Road going through the river is by default a bridge.
 *
 */
interface Road {
  name: string;
  id: roadId;
  data: unknown;
}

/**
 * Zone is one of fundamental building block of the WorlMap.
 *
 * Zone covers specific area.
 * Every zone can be employed for:
 * - triggering effects once player enters it
 * - spawning NpcParties
 * - spawning resources
 *
 * Zone can additionally be a land feature.
 */
interface Zone {
  name: string;
  id: zoneId;
  border: unknown;
  size: unknown;
  spawn: Array<Spawn>;
  onEnter?: Array<effectId[]>;
  description: string;
}

interface Spawn {
  name: string;
  id: spawnId;
  currentSpawn: number;
  maxSpawn: number;
  respawnTime: number;
  respawnTimeDamping: number;
  entity: npcPartyId | landResourceId;
}

interface LandResource {
  name: string;
  id: landResourceId;
  type: LandResourceType;
  quantity: number;
  description: string;
}

interface SpawnZoneTemplate extends SpawnZoneInstance {
  id: spawnZoneTemplateId;
  parameters: unknown;
}

interface SpawnZoneInstance extends Zone {
  id: spawnZoneInstanceId;
}

interface LandFeatureZoneTemplate extends LandFeatureInstance {
  id: landFeatureZoneTemplateId;
  parameters: unknown;
}

interface LandFeatureZoneInstance extends Zone {
  id: landFeatureZoneInstanceId;
  speedModifier: number;
  passable: boolean;
  type: LandFeatureType;
  activitiesAllowed: Array<ActivityType>;
}

enum LandFeatureType {
  Forest = 'Forest',
  TropicalForest = 'TropicalForest',
  Jungle = 'Jungle',
  Jungle = 'Jungle',
  River = 'River',
  Lake = 'Lake',
  CoastLine = 'CoastLine',
  MountainRange = 'MountainRange',
  Mountain = 'Mountain',
  Volcano = 'Volcano',
  Marsh = 'Marsh',
  Ford = 'Ford',
  Meadow = 'Meadow',
  Grassland = 'Grassland',
  Desert = 'Desert',
  Jungle = 'Jungle',
  Bushes = 'Bushes',
  Hills = 'Hills',
  Canyon = 'Canyon',
  Quicksand = 'Quicksand',
  Delta = 'Delta',
  Beach = 'Beach',
  Pond = 'Pond',
  Floodplains = 'Floodplains',
  Cliffs = 'Cliffs',
  Glacier = 'Glacier',
  Caldera = 'Caldera',
  Crater = 'Crater',
  HotSprings = 'HotSprings',
  Geyser = 'Geyser',
  Fumaroles = 'Fumaroles',
  Mudpots = 'Mudpots',
  Gully = 'Gully',
  Ravine = 'Ravine',
  Waterfall = 'Waterfall',
  Hillside = 'Hillside',
  Mountainside = 'Mountainside',
  CustomLandFeature = 'CustomLandFeature'
}

/**
 * Label on the map region.
 * It would either be imprint on the map, or maybe
 * show as a nice tooltip, or sub-header (under the Region name)
 * when you enter given Zone.
 */
interface MapLabel extends Zone {
}

/**
 * Locations are places that player can visit.
 */
interface Location {
  type: LocationType;
  name: string;
  id: locationId;
  marker: markerId;
  importance: Importance;
  locations?: Array<locationId>;
  parentLocation?: locationId;
  /**
   * Temporary location will be destroyed after leaving.
   * It is suitable for encounters.
   */
  temporary?: boolean;
  /**
   * Every location knows ActorInstances that
   * can exist in it.
   */
  actors: Array<actorInstanceId>;
}

/**
 * Importance could later be used to differentiate
 * markers on the map.
 */
enum Importance {
  Low = 'Low',
  Medium = 'Medium',
  High = 'High',
}

enum LocationType {
  Level = 'Level', // 'Explorable level type location',
  Settlement = 'Settlement', // 'settlement type location',
  Building = 'Building', // 'settlement type location',
  Interior = 'Interior', // 'Interior type location',
  Camp = 'Camp', // 'Camp type location',
  Encounter = 'Encounter', // 'Encounter type location',
}

interface Dungeon extends Location {
  level: DungeonLevel;
  map: DungeonMap;
}

interface Settlement extends Location {
  level: SettlementLevel;
  buildings: Array<buildingId>;
  inhabitants: Array<actorId>;
}

/**
 * BuildingTemplate is a template used in development
 * time to generate new Building.
 */
interface BuildingTemplate {
  name: string;
  id: buildingTemplateId;
  /**
   * Building features that can be automatically
   * modified in instantiation process.
   */
  parameters: unknown;
}

/**
 * Building is generated and hand-edited building
 * later used in game.
 * Building is also a location but it's not standalone
 * since it's always a container for Interior.
 */
interface Building {
  name: string;
  id: buildingId;
  parentLocation: locationId;
  interiors: Array<interiorId>;
}

interface BuildingSceneInstance extends Building {
  data: unknown;
}

/**
 * Interior is a type of location.
 * It can either exist wrapped in Building (usually in case
 * of the City), or it can be stand-alone (usually lonely
 * non-dungeon location on the map).
 *
 * If part of a building it is generated properly
 * for that building.
 */
interface Interior extends Location {
  id: interiorId;
  type: InteriorType;
  /**
   * List of other locations interior leads to.
   *
   * Since those are locations there is a lot of possibilities here:
   * it could be a cellar infested with monsters,
   * it could be your bedroom in a tavern,
   * it could be exit back to the city,
   * it could be just another interior,
   * it could be an entry to another building...
   */
  gateways?: Array<locationId>;
}

enum InteriorType {
  hause,
  barack,
  shop,
  //...
}

interface Camp extends Location {
  type: CampType;
  typeVariant: unknown;
}

interface Encounter extends Dungeon {
  temporary: true;
  type: EncounterType;
  typeVariant: unknown;
}

enum EncounterType {
  BattleEncounter = 'BattleEncounter',
}

interface DungeonLevel {
  id: levelId;
  data?: unknown;
}

interface SettlementLevel {
  id: levelId;
  data?: unknown;
}

interface DungeonMap {
  id: dungeonMapId;
  markers: Array<LocationMarker | WorldMarker>;
  width: number;
  height: number;
  data?: unknown;
}

interface Marker {
  name: string,
  id: markerId;
  type: MarkerType;
  size: number;
  hidden: boolean;
  coordinates: {
    x: number,
    y: number,
  };
  parentMap: worldMapId | dungeonMapId;
}

enum MarkerType {
  MarkerToWorld = 'MarkerToWorld', // 'Marker to world',
  MarkerToDungeon = 'MarkerToDungeon', // 'Marker to dungeon location',
  MarkerToSettlement = 'MarkerToSettlement', // 'Marker to settlement location',
  MarkerToInterior = 'MarkerToInterior', // 'Marker to interior location',
  MarkerOfUnit = 'MarkerOfUnit', // 'Marker for interaction with an unit',
}

interface LocationMarker extends Marker {
  target: locationId;
}

interface WorldMarker extends Marker {
  target: worldId;
}

interface PartyMarker extends LocationMarker {
  unit: unitId;
}

interface PlayerPartyMarker extends PartyMarker {
  unit: 0;
}

interface NpcPartyMarker extends PartyMarker {
  id: npcPartyMarkerId;
}

interface View {
  type: ViewType;
  subject: worldId | locationId;
}

enum ViewType {
  worldMapView = 'worldMapView',
  dungeonView = 'dungeonView',
  settlementView = 'settlementView',
  titleScreenView = 'titleScreenView',
}

/* -------------------------------------------------------------------------- */
/* UI */
/**
 * UI is everything that has interactive or presentational function
 * and is not integral part of the level.
 * (It's difficult to be really precise here.)
 */

interface Inventory {}

/**
 * It is container for data allowing to construct
 * believable background for NPC you have dialog with
 * appropriate to the place you are in.
 */
interface DialogBackground {}

interface DialogUI {}

interface DialogInteraction {}

interface TradeInteraction {}

interface PartyUI {}

interface PartyMemberUI {}

interface GameMenu {}

interface GraphicsOptions {}

interface AudioOptions {}

interface GameplayOptions {}

interface Controls {}

/* Memory Management */

/**
 * Entity responsible for smart usage of memory.
 */
interface MemoryManager {}

/**
 * Scene is crucial object that holds references
 * to Instances created for the purpose of given
 * scene.
 *
 * This object is used to preload data reuired for
 * the scene that player is likely to enter, to shorten
 * loading time.
 *
 * This object is also used to free Memory when
 * player is not likely to need the scene for
 * a longer time.
 */
interface Scene {
  id: sceneId;
  type: SceneType;
  /**
   * The location that requires given Scene data.
   */
  location: worldId | locationId;
  /**
   * Probably list of Actor, Building and SceneryObject Instances.
   */
  data: unknown;
  /**
   * How long player is in the scene.
   */
  age: number;
}

enum SceneType {
  WorldMap = 'WorldMap',
  Dungeon = 'Dungeon',
  Settlement = 'Settlement',
  Interior = 'Interior',
  Camp = 'Camp',
  Inventory = 'Inventory',
}

/**
 * Container for various types of information
 * not directly connected to scenes.
 */
interface AuxiliaryData {
  id: auxDataId;
  type: DataType;
  data: unknown;
}

enum DataType {
  Dialog = 'Dialog',
  UI = 'UI',
  Party = 'Party',
}

/* -------------------------------------------------------------------------- */
/* Debug, testing and validation */
/**
 * Things helpful to see the state, check data for consistency and
 * validate behaviour as much as possible.
 */

/**
 * This is dev-time debug
 *
 * On game state initiation look for unfinishable quests
 */
function ValidateQuests(): void

/* -------------------------------------------------------------------------- */
/* Game state and configuration */

/**
 * Game state is minimal required information that feed
 * to the game allows restoring it's state from any
 * previous time that the information pertains to.
 *
 * That information is easiet to determine by taking look
 * at any mutations that game systems allow.
 * Everything that is mutated at least once is stateful
 * and should be possible to save.
 */

interface GameWorldState {
  currentView: View;
}

/**
 * Properties that may be constant, or that which are modifiable
 * but independent from the in-game operations and can vary
 * for two identical states running at different points in time.
 *
 * Examples of this modifiable data:
 *  - quotients and stats modifying game mechanics
 *  - graphical, audio and gameplay settings
 */
interface GameConfiguration {}

interface GameController {}
