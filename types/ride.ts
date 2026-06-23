export interface Booking {
  id: string;
  rideId: string;
  userId: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  createdAt: string;
  user: { name: string };
}

export interface Ride {
  id: string;
  driverName: string;
  from: string;
  to: string;
  price: number;
  seats: number;
  time: string;
  createdAt: string;
  userId: string;
  bookings: Booking[];
}