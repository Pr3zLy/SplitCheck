
export interface ReceiptItem {
  id: string;
  prodotto: string;
  quantita: number;
  prezzo: number;
}

export interface Person {
  id: string;
  name: string;
  // Map of item ID to the portion of quantity assigned to this person.
  // e.g., { 'item-123': 0.5 } means this person is responsible for half of item-123.
  assignments?: Record<string, number>;
}
