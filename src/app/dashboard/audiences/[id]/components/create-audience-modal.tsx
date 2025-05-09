"use client";

import { useState } from "react";
import { useIntegrationApp } from "@integration-app/react";
import { Icons } from "@/components/ui/icons";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdAccounts } from "../hooks/useAdAccounts";

interface CreateAudienceModalProps {
  trigger?: React.ReactNode;
}

export function CreateAudienceModal({ trigger }: CreateAudienceModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAdAccount, setSelectedAdAccount] = useState<string>();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const integrationApp = useIntegrationApp();

  const { adAccounts, isLoading: isLoadingAdAccounts } = useAdAccounts({
    enabled: isOpen,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdAccount || !name) return;

    setError(null);
    setIsCreating(true);

    try {
      await integrationApp
        .connection("facebook-ads")
        .action("create-custom-audience")
        .run({
          description,
          name,
          fbAdAccountId: selectedAdAccount,
        });

      setIsOpen(false);
      // Reset form
      setName("");
      setDescription("");
      setSelectedAdAccount(undefined);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to create audience. Please try again."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {trigger || (
          <Button size="sm" variant="outline" className="gap-2">
            <Icons.plus className="h-4 w-4" />
            Create Audience
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-4" align="end">
        <div className="space-y-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="adAccount">Select Ad Account</Label>
                <Select
                  value={selectedAdAccount}
                  onValueChange={setSelectedAdAccount}
                  disabled={isLoadingAdAccounts}
                >
                  <SelectTrigger id="adAccount" className="w-full">
                    <SelectValue
                      placeholder={
                        isLoadingAdAccounts
                          ? "Loading ad accounts..."
                          : "Select an ad account"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {adAccounts?.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Audience Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter audience name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter audience description"
                  rows={3}
                />
              </div>
            </div>

            {error && (
              <div className="rounded-md bg-red-500 p-3 text-sm text-white">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={!selectedAdAccount || !name || isCreating}
            >
              {isCreating ? "Creating..." : "Create Audience"}
            </Button>
          </form>
        </div>
      </PopoverContent>
    </Popover>
  );
}
