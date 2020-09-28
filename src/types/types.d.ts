
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

  export interface Task {
    id: taskId;
    name: string;
    questId: questId;
    /**
     * Labours end up as subscriptions to proper state transition on
     * entity they concern (e.g. expectation to win in battle encounter).
     */
    labours: Labour[];
    /**
     * Effect is some immediate result of fulfilling labours (e.g. granting currency).
     */
    effects: Effect[];
    /**
     * Certain states which will result in player failing the task and the quest.
     */
    failures: Labour[];
    onFailure: Effects[];
    /**
     * Becomes active when previous task is done. Active task generates
     * subscriptions according to labours.
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

  export interface Labour {
    labourType: LabourType;
    payload?: {
      entityId?: string
    }
  }

  enum LabourType {
    WinBattleLabour = 'WinBattleLabour', // 'Win battle',
    LoseBattleLabour = 'LoseBattleLabour', // 'Lose battle',
    SelectDialogLabour = 'SelectDialogLabour', // 'Select dialog',
    VisitRegionLabour = 'VisitRegionLabour', // 'Visit region',
    VisitLocationLabour = 'VisitLocationLabour', // 'Visit location',
    VisitMarkerLabour = 'VisitMarkerLabour', // 'Visit marker',
    ObtainItemLabour = 'ObtainItemLabour', // 'Obtain item',
    InteractWithLabour = 'InteractWithLabour', // 'Interact with object',
    CustomLabour = 'CustomLabour', // 'Custom labour'
  }

  interface Effect {
    effectType: EffectType,
    payload: {
      entityId?: string
    }
  }

  enum EffectType {
    GrantExperienceEffect = 'GrantExperienceEffect', // 'Grant experience points',
    GrantCurrencyEffect = 'GrantCurrencyEffect', // 'Grant currency',
    RemoveCurrencyEffect = 'RemoveCurrencyEffect', // 'Remove currency',
    GrantItemEffect = 'GrantItemEffect', // 'Grant item',
    RemoveItemEffect = 'RemoveItemEffect', // 'Remove item',
    EnableDialogEffect = 'EnableDialogEffect', // 'Enable dialog',
    DisableDialogEffect = 'DisableDialogEffect', // 'Disable dialog',
    AddMemberEffect = 'AddMemberEffect', // 'Add member to the party',
    RemoveMemberEffect = 'RemoveMemberEffect', // 'Remove member from the party',
    UncoverLocationEffect = 'UncoverLocationEffect', // 'Uncover location',
    GrantSkillPointsEffect = 'GrantSkillPointsEffect', // 'Grant skill points',
    RemoveSkillPointsEffect = 'RemoveSkillPointsEffect', // 'Remove skill points',
    GrantAbilityEffect = 'GrantAbilityEffect', // 'Grant ability',
    RemoveAbilityEffect = 'RemoveAbilityEffect', // 'Remove ability',
    RepairItemEffect = 'RepairItemEffect', // 'Repair item',
    TransportPartyEffect = 'TransportPartyEffect', // 'Transport party',
    GrantLootEffect = 'GrantLootEffect', // 'Grant loot',
    AddJournalEntryEffect = 'AddJournalEntryEffect', // 'Add journal entry',
    ActivateTaskEffect = 'ActivateTaskEffect', // 'Activate task',
    CompleteQuestEffect = 'CompleteQuestEffect', // 'Complete quest',
    FailQuestEffect = 'FailQuestEffect', // 'Fail quest',
    TravelToCoordinatesEffect = 'TravelToCoordinatesEffect', // 'Travel to coordinates on the road',
    TravelToMarkerEffect = 'TravelToMarkerEffect', // 'Travel to map marker',
    ActivateMarkerEffect = 'ActivateMarkerEffect', // 'Activate marker',
    RunScriptEffect = 'RunScriptEffect', // 'Run script',
  }

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
    effects: Effect[];
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

  interface ActorsGroup {
    name: string;
    id: groupId;
  }

  interface Actor {
    id: actorId;
    type: actorType;
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
   * Scene type.
   *
   * Region is presented as a (largely) 2D map.
   * It is the largest part of game-world that player is presented with at once.
   *
   * Region should always synonymous with some world part that can
   * also be seen as separate in world-building terms.
   */
  interface Region {
    name: string;
    id: regionId;
    locations: Array<locationId>;
    map: regionMapId;
  }

  interface RegionMap {
    id: regionMapId;
    markers: Array<LocationMarker | RegionMarker | UnitMarker>;
    width: number;
    height: number;
    roads: Array<Road>;
    data: unknown; // bitmap?
  }

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
   */
  interface Road {
    name: string;
    id: roadId;
    map: regionMapId;
    data: unknown;
  }

  /**
   * Locations are places that player can visit.
   */

  interface Location {
    type: LocationType;
    name: string;
    id: locationId;
    parentRegion: regionId;
    locations?: Array<locationId>;
    parentLocation?: locationId;
    /**
     * Temporary location will be destroyed after leaving.
     * It is suitable for encounters.
     */
    temporary?: boolean;
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
    inhabitants: Array<Actor>;
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
    markers: Array<LocationMarker | RegionMarker>;
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
    parentMap: regionMapId | dungeonMapId;
  }

  enum MarkerType {
    MarkerToRegion = 'MarkerToRegion', // 'Marker to region',
    MarkerToDungeon = 'MarkerToDungeon', // 'Marker to dungeon location',
    MarkerToSettlement = 'MarkerToSettlement', // 'Marker to settlement location',
    MarkerToInterior = 'MarkerToInterior', // 'Marker to interior location',
    MarkerOfUnit = 'MarkerOfUnit', // 'Marker for interaction with an unit',
  }

  interface LocationMarker extends Marker {
    target: locationId;
  }

  interface RegionMarker extends Marker {
    target: regionId;
  }

  interface UnitMarker extends LocationMarker {
    unit: unitId;
  }

  interface PartyMarker extends Marker {}

  interface View {
    type: ViewType;
    subject: regionId | locationId;
  }

  enum ViewType {
    regionMapView = 'regionMapView',
    dungeonView = 'dungeonView',
    settlementView = 'settlementView',
    titleScreenView = 'titleScreenView',
  }

  interface DialogBackground {}

  interface DialogUI {

  }

  interface DialogInteraction {}

  interface TradeInteraction {}

  interface PartyUI {}

  interface PartyMemberUI {}

  /*  */

  /**
   * This is dev-time debug
   *
   * On game state initiation look for unfinishable quests
   */
  function ValidateQuests(): void


  /* Game state inspector */

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

