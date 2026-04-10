export interface UserLookupInput {
  email?: string;
  id?: string;
  phone?: string;
}

// Phase 1 scaffold: Phase 2 will move concrete user reads and writes here.
export async function findUser(input: UserLookupInput): Promise<never> {
  void input;
  throw new Error("findUser is not implemented yet.");
}
