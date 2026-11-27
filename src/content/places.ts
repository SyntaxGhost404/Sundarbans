import type { PlaceId } from '../lib/store'

export interface Place {
  id: PlaceId
  name: string
  bn: string
  lat: number
  lng: number
  note: string
}

// Coordinates are approximate, to two decimals.
export const places: Place[] = [
  { id: 'dhaka', name: 'Dhaka', bn: 'ঢাকা', lat: 23.81, lng: 90.41, note: 'Home' },
  { id: 'chapitala', name: 'Raja Chapitala', bn: 'রাজা চাপিতলা', lat: 23.64, lng: 90.93, note: 'Case 01' },
  { id: 'mongla', name: 'Mongla', bn: 'মোংলা', lat: 22.49, lng: 89.6, note: 'Case 02' },
  { id: 'kotka', name: 'Kotka', bn: 'কটকা', lat: 21.85, lng: 89.77, note: 'Sea face' },
]

export const placeById = Object.fromEntries(places.map((p) => [p.id, p])) as Record<PlaceId, Place>
