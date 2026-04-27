export interface Association {
  id: string;
  name: string;
  union: string;
  country: string;
  reportDeadlineDay: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExtraRecipient {
  id: string;
  associationId: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface AddExtraRecipientRequest {
  email: string;
  name: string;
}
