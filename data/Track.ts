import { Album } from "./Album";

export class Track extends Parse.Object {
    
    public get Length() : number {
        return this.get("Length");
    }
    public set Length(length: number) {
        this.set("Length", length);
    }
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
    public get Metadata() : string{
        return this.get("Metadata");
    }

    public set Metadata(value: string){
        this.set("Metadata", value);
    }

    public get Size() : number {
        return this.get("Size");
    }

    public set Size(value: number ){
        this.set("Size", value);
    }
    public get Hash() : string {
        return this.get("Hash");
    }

    public set Hash(value: string ){
        this.set("Hash", value);
    }

    constructor(){
        super("Track");
    }

}