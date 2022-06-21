import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";

export enum Players {
  X = "X",
  O = "O"
}



type GameMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Game {
  readonly id: string;
  readonly playerX: string;
  readonly playerO?: string | null;
  readonly map?: string | null;
  readonly currentPlayer: Players | keyof typeof Players;
  readonly pointsX?: number | null;
  readonly pointsO?: number | null;
  readonly createdAt?: string | null;
  readonly updatedAt?: string | null;
  constructor(init: ModelInit<Game, GameMetaData>);
  static copyOf(source: Game, mutator: (draft: MutableModel<Game, GameMetaData>) => MutableModel<Game, GameMetaData> | void): Game;
}