import { Socket } from "socket.io";
import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from "typeorm";
// import { Friendship } from "./frienships/friendship.entity";

class Invite {
	invitation: number = 3;
	inviteHost: string = '';
}

@Entity ()
export class User {

	@PrimaryGeneratedColumn ()
	userID: number = 0;

	@Column({
		default: false
	})
	twoFact: boolean = false;

	@Column({
		unique: true,
		nullable: true
	})
	email: string = '';

	@Column()
	avatar: string = '';

	@Column({default: 3})
	invitationstatus: number = 3;

	@Column({default: ''})
	inviteHost: string = '';

	@Column ({
		unique: true
	})
	username: string;

	@Column ()
	chats: string = "";

	constructor (username: string) {
		this.username = username;
	}

	/** socket.io impl */
	private socket: Socket|null = null;

	setSocket (socket: Socket) {
		this.socket = socket;
	}

	getSocket () {
		return this.socket;
	}
	
	@Column({nullable: true})
	wins: number = 0;

	@Column({nullable: true})
	loses: number = 0;

	@Column({nullable: true})
	ties: number = 0;

	@Column({nullable: true})
	online: boolean = true;

	@Column('text', {array: true})
	scores: string[] = [];

	@Column('text', {array: true})
	opponents: string[] = [];

	@Column()
	gamesPlayed: number = 0;

	@Column('boolean', {array: true})
	gameWins: boolean[] = [];

	//TODO instead of online status?
	@Column({nullable: true})
	status: 'online' | 'offline'| 'in game' = 'online';

	@Column('int', {array: true, nullable: true})
	friends: number[] | null = null;

	@Column('int', {array: true, nullable: true})
	pending: number[] | null = null;

	@Column('int', {array: true, nullable: true})
	blocked: number[] | null = null;

	@Column({nullable: true})
	tfaSecret?: string;
}
