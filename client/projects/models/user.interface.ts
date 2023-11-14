export interface User {

	userID: number;
	online: boolean;
	twoFact: boolean;
	email: string;
	username: string;
    avatar: string;
	wins: number;
	loses: number;
	score: number;
	chats: string;
	isFriend: boolean;

	scores: string[];
	opponents: string[];
	gamesPlayed: number;
	gameWins: boolean[];

	friends: number[];
	pending: number[];
	blocked: number[];
	friendProfiles: User[];
	pendingProfiles: User[];
	blockedProfiles: User[];

	matchHistory: GameResult[]; // Array to store game results
}

export class GameResult {
	win: boolean;
	opponentName: string;
	endScores: string;
	constructor(win: boolean, opponentName: string, endScores: string) {
		this.win = win;
		this.opponentName = opponentName;
		this.endScores = endScores;
	}
  };