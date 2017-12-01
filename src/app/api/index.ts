// import { randomDelay } from './PromiseExtensions'
import { fetchRandomPeople } from './_randomPeople'

export enum SheriffAbility {
    None = 0,
    CanTransfer = 1 << 0,
    CourtAppearance = 1 << 1,
    SignDocuments = 1 << 2,
    All = CanTransfer | CourtAppearance | SignDocuments
}


export interface Sheriff {
    name: string
    badgeNumber: number
    imageUrl: string
    abilities: SheriffAbility
}

export interface SheriffTask {
    id: number;
    title: string;
    description: string;
    requiredAbilities: SheriffAbility;
    sheriffIds: number[];
}

export interface API {
    getSheriffs(): Promise<SheriffMap>;
    getSheriffTasks(): Promise<SheriffTaskMap>;
}

// type SheriffKey = Sheriff["badgeNumber"];

export type SheriffMap = {[key:number]:Sheriff}

// type SheriffTaskKey = SheriffTask['id'];
export type SheriffTaskMap = {[key:number]:SheriffTask}

function arrayToMap<T,TKey>(array: T[], keySelector: (t: T) => TKey) {
    const mappedArray  = array.reduce<any>((map,i)=>{
        map[keySelector(i)] = i;
        return map;
    },{});
    return mappedArray;
}


class Client implements API {

    async getSheriffs(): Promise<SheriffMap> {
        let people = await fetchRandomPeople();
        let badgeNumber = 0;
        const sheriffList = people.results.map(p => {
            let s: Sheriff = {
                name: `${p.name.first} ${p.name.last}`,
                badgeNumber: badgeNumber++,
                imageUrl: p.picture.large,
                abilities: SheriffAbility.All
            };
            return s;
        });

        return arrayToMap(sheriffList,(s)=>s.badgeNumber) as SheriffMap;
    }

    async getSheriffTasks() : Promise<SheriffTaskMap> {
        // await randomDelay(200, 1000);
        const taskMap : SheriffTaskMap = arrayToMap(tasks,(t)=>t.id);
        return Promise.resolve(taskMap);
    }
}

const tasks: SheriffTask[] = [
    {
        id: 0,
        title: 'Some Task 0 ',
        description: 'A moderate task',
        requiredAbilities: SheriffAbility.CanTransfer | SheriffAbility.CourtAppearance,
        sheriffIds: []
    },
    {
        id: 1,
        title: 'Some Task 1',
        description: 'A easy task',
        requiredAbilities: SheriffAbility.CanTransfer,
        sheriffIds: [3]
    },
    {
        id: 2,
        title: 'Some Task 2 ',
        description: 'A moderate task',
        requiredAbilities: SheriffAbility.CourtAppearance,
        sheriffIds: [1]
    },
    {
        id: 3,
        title: 'Some Task 3',
        description: 'A moderate task',
        requiredAbilities: SheriffAbility.All,
        sheriffIds: [0, 5]
    },
    {
        id: 4,
        title: 'Some Task 4 ',
        description: 'A moderate task',
        requiredAbilities: SheriffAbility.CanTransfer | SheriffAbility.CourtAppearance,
        sheriffIds: []
    },
    {
        id: 5,
        title: 'Some Task 5 ',
        description: 'A moderate task',
        requiredAbilities: SheriffAbility.CanTransfer | SheriffAbility.CourtAppearance,
        sheriffIds: []
    },
];

export default new Client();