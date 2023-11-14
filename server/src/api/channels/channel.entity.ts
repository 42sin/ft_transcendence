import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

/**
 * Channel entity for ORM representing a channel with all of its properties and methods.
 * @property channelID: the unique identifer of the channel entity;
 * @property name: the name of the channel;
 * @property password: the ~~password~~ hash, which secures access to the channel;
 * @property topic: the topic of the chanel;
 * @property member: a list of comma-seperated userIDs of the User members of the chanel.
 * @property private: whether a channel is private/hidden or not.
 */
@Entity ()
export class Channel {

	@PrimaryGeneratedColumn ()
	channelID: number = 0;

	@Column ()
	name: string;

	@Column ()
	password: string = "";

	@Column ()
	topic: string = "";

	@Column ()
	members: string = "";

	@Column ()
	privateStatus: boolean = false;

	@Column ({nullable: true})
	owner: number = 0;

	@Column({nullable: true})
	banned: string = ''
	
	@Column({nullable: true})
	admins: string = ''

	@Column({ type: 'simple-json', nullable: true })
	muted: { user_id: number, future_time: Date }[] = [];

	constructor (
		name: string,
		password: string,
		privateStatus: boolean,
		owner: number
		) {
		this.name = name;
		this.password = password;
		this.privateStatus = privateStatus;
		this.owner = owner;
		this.admins += owner;
	}
}
