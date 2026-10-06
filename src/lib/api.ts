export type ApiCattle = {
  id: string;
  cattleId: string;
  name: string | null;
  breed: string | null;
  sex: string | null;
  farmer: {
    village: string;
    user: {
      name: string;
    };
  };
  treatments: {
    id: string;
    medicineName: string;
    dosage: string | null;
    administeredAt: string;
    withdrawalEnds: string | null;
    reason: string | null;
  }[];
};

export async function fetchCattle(): Promise<ApiCattle[]> {
  const response = await fetch("http://localhost:3000/api/cattle");

  if (!response.ok) {
    throw new Error("Failed to fetch cattle");
  }

  return response.json();
}