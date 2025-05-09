import { Audience } from "@/models/audience";
import { AudienceMember } from "@/models/audience-member";
import connectDB from "./lib/mongodb";
import dotenv from "dotenv";
import path from "path";

const sampleAudiences = [
  {
    name: "VIP Customers",
    description: "High-value customers with premium status",
    memberCount: 0,
  },
  {
    name: "Newsletter Subscribers",
    description: "Regular newsletter subscribers",
    memberCount: 0,
  },
  {
    name: "Beta Testers",
    description: "Early adopters and beta program participants",
    memberCount: 0,
  },
];

const sampleMembers = [
  {
    email: "john.doe@example.com",
    firstName: "John",
    lastName: "Doe",
  },
  {
    email: "jane.smith@example.com",
    firstName: "Jane",
    lastName: "Smith",
  },
  {
    email: "bob.wilson@example.com",
    firstName: "Bob",
    lastName: "Wilson",
  },
  {
    email: "alice.johnson@example.com",
    firstName: "Alice",
    lastName: "Johnson",
  },
  {
    email: "charlie.brown@example.com",
    firstName: "Charlie",
    lastName: "Brown",
  },
];

export async function seedAudiencesAndMembers() {
  try {
    // Clear existing data
    await Audience.deleteMany({});
    await AudienceMember.deleteMany({});

    // Create audiences
    const createdAudiences = await Audience.insertMany(sampleAudiences);

    // Create members for each audience
    for (const audience of createdAudiences) {
      const members = sampleMembers.map((member) => ({
        ...member,
        audienceId: audience._id,
      }));

      await AudienceMember.insertMany(members);

      // Update audience member count
      await Audience.findByIdAndUpdate(audience._id, {
        memberCount: members.length,
      });
    }

    console.log("✅ Successfully seeded audiences and members");
    return {
      audiences: createdAudiences,
      totalMembers: createdAudiences.length * sampleMembers.length,
    };
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

(async () => {
  const pathName = path.resolve(process.cwd(), ".env");

  dotenv.config({
    path: pathName,
  });

  await connectDB();
  await seedAudiencesAndMembers();
})();
