import { Audience } from "@/models/audience";
import { AudienceMember } from "@/models/audience-member";
import { DataOrigin } from "@/models/common";
import mongoose from "mongoose";

const sampleAudiences = [
  {
    name: "VIP Customers",
    description: "High-value customers with premium status",
    memberCount: 0,
    origin: DataOrigin.APP,
  },
  {
    name: "Newsletter Subscribers",
    description: "Regular newsletter subscribers",
    memberCount: 0,
    origin: DataOrigin.APP,
  },
  {
    name: "Beta Testers",
    description: "Early adopters and beta program participants",
    memberCount: 0,
    origin: DataOrigin.APP,
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

async function connectDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      return;
    }

    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("Please define the MONGODB_URI environment variable");
    }

    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    throw error;
  }
}

export async function seedAudiencesAndMembers() {
  try {
    await connectDB();

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
  } finally {
    // Close the connection after seeding
    await mongoose.connection.close();
    console.log("✅ Closed MongoDB connection");
  }
}

// If this file is run directly (not imported)
if (require.main === module) {
  seedAudiencesAndMembers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}
