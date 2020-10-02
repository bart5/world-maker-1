
declare global {

  type taskId = string
  type questId = string
  type actorId = string
  type actorInstanceId = string
  type groupId = string
  type dialogId = string
  type dialogLineId = string
  type journalEntryId = string
  type regionId = string
  type locationId = string
  type regionMapId = string
  type locationMapId = string
  type markerId = string
  type roadId = string
  type locationViewId = string
  type dungeonMapId = string
  type levelId = string
  type unitId = string
  type effectId = string

  export interface Task {
    id: taskId;
    name: string;
    questId: questId;
    /**
     * Work end up as subscriptions to proper state transition on
     * entity they concern (e.g. expectation to win in battle encounter).
     */
    work: Work[];
    /**
     * Effect is some immediate result of fulfilling work (e.g. granting currency).
     */
    effects: effectId[];
    /**
     * Certain states which will result in player failing the task and the quest.
     */
    failures: Work[];
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
    formerTask: taskId;
    nextTasks: taskId[]; // most of the times there will be just one next task
  }

  /**
   * Quest is just a wrapper for tasks which are *the* meat and potatoes
   * of the quest-system.
   */
  export interface Quest {
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

  export interface Work {
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
  export interface Journal {
    activeQuests: {
      [questId as string]: Array<JournalEntry> // later filtered by date for display
    };
    completedQests: {
      [questId as string]: Array<JournalEntry>
    };
    failedQuests: {
      [questId as string]: Array<JournalEntry>
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
    [actorInstanceId as string]: Array<ConversationEntry>
  }

  interface ConversationEntry {
    id: conversationEntryId;
    actorInstanceId: actorInstanceId;
    dialogLine: DialogLine;
    entryDate: string;
  }

  /* Bestiary */

  /* Notes about locations and regions */

  /* Notes about people */

  /* Dialogs */

  export interface Dialog {
    id: dialogId;
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
    actorsExcluded?: actorInstanceId[];
    groupsExcluded?: groupId[];
    actorsIncluded?: actorInstanceId[];
    groupsIncluded?: groupId[];
    startDialogLine: dialogLineId;
  }

  export interface DialogLine {
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

  function Prompter(actorInstanceId: actorInstanceId): DialogOptions

  /* Actors */

  interface Group {
    name: string;
    id: groupId;
    actors: Array<actorInstanceId>;
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
   * If situation requires randomness instances
   * then proper Template can be created and used in ad-hoc
   * Actor creation and Instantiation.
   * But it will be more resource intensive.
   */
  interface Actor {
    name: string;
    id: actorId;
    type: actorType;
    occupation: any;
    /**
     * data will information related to graphics and sounds.
     */
    data: unknown;
    group?: groupId;
    attributes: ActorAttributes;
    traits: ActorTraits;
    abilities: ActorAbilities;
    skills?: ActorSkills;
  }

  interface ActorTypeSymbol {

  }

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
    id: actorInstanceId;
    /**
     * Config defines set of variables that make this
     * instance produced from Actor special.
     */
    config: unknown;
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
    id: unitId;
    hostile: boolean;
    type: UnitType;
    actors: Array<actorInstanceId>;
  }

  /*  */

  /**
   * Schedule.
   *
   * It's important to make sure schedules are either valid
   * or have good fallbacks, and that primary functions
   * of the Actor (expecially one that Player may need)
   * are fulfilled.
   */
  interface ActorSchedule {
    name: string;
    id: scheduleId;
    schedule: {
      [day in WeekDays]: DayPlan;
    }
  }

  /**
   * Can change later to something fancy.
   */
  enum WeekDays {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Sunday = 'Sunday',
  }

  /*
    Schedule is one of the hardest part of the entire system.
    It adds variety and life to the game world.
    But it's a difficult task from implementation and testing point of view.

    In thinking about the system let's remember that it's not meant for the
    simulation of the world - it's as an illusion and something
    to fool the player into thinking of tha game as a living system.
    Keeping that in mind remember to cut corners whenever player
    cannot see it, and 'simulate' only that what player will notice
    and appreciate.

    For development and content production sake scheduling system has to
    - Be possible to be turned off
    - Be possible to be turned off for all quest NPCs
    - Give tools for easy schedule creation and edition

    Key assumptions and decisions:
    - NPC parties cannot engage in combat if player is not around
    - NPC parties combat scenarios:
      -- If both parties are hostile type they can kill one another
      -- If one party is non-hostile then it can:
        --- Get robbed
        --- Get battered and beaten unconscious. The enemy leaves.
            Citizens come to life after some time and continue the travel.
        --- Citizens can beat the hostile party
    - Hostile parties have their spawn zones and have chance of appearing there
    every time player is nearby. The chance realization zeroes the spawn-point chance
    for next couple of days. Further, if player fought the party it zeroes the next
    spawn chance for even longer.
    Player also has their own multiplayer for enemy spawn chance to prevent enemies
    spawning too often - i.e. if Player have 'spawned' 1 enemy, then they get -X% chance
    to spawn at next "hostile spawning" zone they enter.
    If hostile party is not observed for a day it disappears.
    Hostile parties have their own AI and will go about various activities depending
    on the type of their party.

    * Escort - Expendable actors which are generated for certain kind of
    NPC parties and exist only for the purpose of the travel.
    * Statists - Actors generated for each city who don't travel
    but have some simple schedule within the city. They generate some additional
    crowd and are automatically assigned to some interiors.
    * Locations like hauses get automatically additional rooms for every actor
    who has interior assigned as a house.
    * Taverns in theory have infinite capacity (if not rooms, then maybe a barn or just
      anywhere)

    # Interactions connected to the fact of NPCs traveling:

    # Defining actor schedule:
    -

    # Resolving actor schedule

    # What if actor get's out of sync with it's schedule by any
      kind interference possible?

    - For citizen:
      -- He prioritizes going back to home location and continue schedule
    - For Hostile:
      --

    # What about combat-capable parties?
    - They are formed

    # What about assigning quest to travel-capable NPC later on?
      Just rule-of-thumb - that should not happen?

    # How actually are NPC going to be created?
      Some of them play important role being traders, trainers or quest NPCs.

  */


  /**
   * Day plan
   */
  interface DayPlan {
    // chores: Array<Chore | Travel>;
    queue: Array<activityId>;
  }

  interface Activity {
    name: string;
    id: activityId;
    startTime: number;
    endTime: number;
  }

  /**
   * Chore is an activity in a given location.
   */
  interface Chore {
    earliestStartTime: number;
    latestEndTime: number;
    location: locationId;
    activity: unknown;
  }

  interface TravelPlan {
    start: locationId | Coordinates;
    route: Array<Checkpoint>;
  }

  interface Checkpoint {
    id: checkpointId;
    destination: locationId | Coordinates;
    onArrival?: Array<choreId>;
  }

  interface Coordinates {
    x: number;
    y: number;
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
    markers: Array<LocationMarker | UnitMarker>;
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
    // map: regionMapId;
    data: unknown;
  }

  interface LandFeature {
    speedModifier: number;
    passable: boolean;
    isZone?: boolean;
    zone: zoneId;
  }

  interface Forest {}

  interface River {}

  interface Lake {}

  interface CoastLine {}

  interface MountainRange {}

  interface Mountain {}

  interface Volcano {}

  interface Marsh {}

  interface Ford {}

  interface Meadow {}

  interface Grassland {}

  interface Desert {}

  interface Jungle {}

  interface Bushes {}

  interface Hills {}

  interface Canyon {}

  interface Quicksand {}

  interface Delta {}

  interface Beach {}

  interface Pond {}

  interface Floodplains {}

  interface Cliffs {}

  interface Glacier {}

  interface Caldera {}

  interface Crater {}

  interface HotSprings {}

  interface Geyser {}

  interface Fumaroles {}

  interface Mudpots {}

  interface Gully {}

  interface Ravine {}

  interface Waterfall {}

  interface Hillside {}

  interface Mountainside {}

  interface CustomLandFeature {}

  /**
   * Some geographical names:
   *
   * plateau
   * plane
   * tableland
   * badland
   * valley
   *
   */


  /**
   * Zone is a WorldMap-bound trigger for party location.
   *
   * It is meant as a convenient way of installing various effects
   * on the WorldMap that can happen if party reaches certain area.
   *
   * It could be scripted encounter, it could be commentary from
   * a party member, it could be some other special event related
   * to the place.
   */
  interface Zone {
    name: string;
    id: zoneId;
    triggerArea: unknown;
    effects: effectId[];
    payload: unknown;
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
    // inhabitants: Array<actorInstanceId>;
    buildings: Array<buildingId>;
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

  interface UnitMarker extends LocationMarker {
    unit: unitId;
  }

  interface PartyMarker extends UnitMarker {
    unit: 0;
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
}

