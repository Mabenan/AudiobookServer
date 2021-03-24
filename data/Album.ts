export class Album extends Parse.Object{

    public get Name(): string {
        return this.get("Name");
    }
    public set Name(value: string){
        this.set("Name", value);
    }
    public get Tracks(): Parse.Relation{
        return this.relation("Tracks");
    }


    constructor(){
        super('Album');
    }
}