
declare global {

  type taskId = string
  type questId = string
  type actorId = string
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
    target?: actorId | AreaOfEffect;
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
    [actorId as string]: Array<ConversationEntry>
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
    actorsExcluded?: actorId[];
    groupsExcluded?: groupId[];
    actorsIncluded?: actorId[];
    groupsIncluded?: groupId[];
    startDialogLine: dialogLineId;
  }

  export interface DialogLine {
    id: dialogLineId;
    dialogId: dialogId;
    actor: actorId;
    content: string;
    formerDialogLine: dialogLineId;
    nextDialogLines: dialogLineId[];
    effects: effectId[];
    emotion: Emotions;
    /**
     * option number allows manual control of dialog options ordering.
     */
    optionNumber?: number;
  }

  enum Emotions {
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

  function Prompter(actorId: actorId): DialogOptions

  /* Actors */

  interface Group {
    name: string;
    id: groupId;
    actors: Array<actorId>;
  }

  interface Actor {
    name: string;
    id: actorId;
    type: actorType;
    occupation: any;
    routine: routineId;
    group?: groupId;
  }

  enum ActorType {

  }

  interface Party {}

  interface Unit {}

  enum UnitType {
    HostileUnit = 'HostileUnit', // 'Hostile unit',
    NeutralUnit = 'NeutralUnit', // 'Neutral unit',
  }

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
    marker: LocationMarker;
    importance: Importance;
    locations?: Array<locationId>;
    parentLocation?: locationId;
    /**
     * Temporary location will be destroyed after leaving.
     * It is suitable for encounters.
     */
    temporary?: boolean;
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
    LevelLocation = 'LevelLocation', // 'Explorable level type location',
    SettlementLocation = 'SettlementLocation', // 'settlement type location',
    InteriorLocation = 'InteriorLocation', // 'Interior type location',
    CampLocation = 'CampLocation', // 'Camp type location',
    EncounterLocation = 'EncounterLocation', // 'Encounter type location',
  }

  interface Dungeon extends Location {
    level: DungeonLevel;
    map: DungeonMap;
  }

  interface Settlement extends Location {
    level: SettlementLevel;
    inhabitants: Array<actorId>;
  }

  interface Interior extends Location {
    capacity: number;
    type: InteriorType;
    typeVariant: unknown;
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

  interface Unit {
    name: string;
    id: unitId;

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

