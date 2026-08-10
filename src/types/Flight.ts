export interface Flight {

    id:number;
    flightNumber:string;
    departureTime:string;
    arrivalTime:string;
    status:string;
    airline:string;
    origin:string;
    destination:string;
    startingPrice: number | null;
}