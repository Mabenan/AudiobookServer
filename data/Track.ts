import { Album } from "./Album";

export class Track extends Parse.Object {

    public get Name() : string{
        return this.get("Name");
    }

    public set Name(value: string){
        this.set("Name", value);
    }

    public get Order() : number {
        return this.get("Order");
    }

    public set Order(value: number ) {
        this.set("Order", value);
    }

    public get File(): string{
        return this.get("File");
    }

    public set File(value :string) {
        this.set("File", value);
    }

    public get Album(): Album {
        return this.get("Album");
    }
    public set Album(value : Album) {
        this.set("Album", value);
    }

    constructor(){
        super("Track");
    }

}