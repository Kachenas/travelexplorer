'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/utils/cn'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { completeOnboardingAction, uploadDocumentsAction } from '@/actions/profile-actions'
import { createVanAction } from '@/actions/van-actions'
import { createAccommodationAction } from '@/actions/accommodation-actions'
import { createTourAction } from '@/actions/tour-actions'
import {
  TruckIcon,
  BuildingOfficeIcon,
  MapIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline'
import { isValidImageFile } from '@/utils/validate-image'

interface OnboardingWizardProps {
  fullName: string
}

type OwnerType = 'van_owner' | 'hotel_owner' | 'tour_operator'

const ownerOptions: {
  value: OwnerType
  label: string
  description: string
  icon: typeof TruckIcon
}[] = [
  {
    value: 'van_owner',
    label: 'Van Renter',
    description: 'Rent out vans with drivers for road trips across Luzon',
    icon: TruckIcon,
  },
  {
    value: 'hotel_owner',
    label: 'Hotelier',
    description: 'List hotels, homestays, or resorts for travelers',
    icon: BuildingOfficeIcon,
  },
  {
    value: 'tour_operator',
    label: 'Tour Operator',
    description: 'Offer guided tours and experiences to visitors',
    icon: MapIcon,
  },
]

export function OnboardingWizard({ fullName }: OnboardingWizardProps) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [selectedType, setSelectedType] = useState<OwnerType | null>(null)
  const [name, setName] = useState(fullName)
  const [nationality, setNationality] = useState('')
  const [contactNumber, setContactNumber] = useState('')
  const [isPending, startTransition] = useTransition()
  const [identificationFile, setIdentificationFile] = useState<File | null>(null)
  const [businessPermitFile, setBusinessPermitFile] = useState<File | null>(null)
  const [documentFile, setDocumentFile] = useState<File | null>(null)

  function handleFileSelect(
    file: File | undefined,
    setter: (v: File | null) => void,
  ) {
    if (!file) {
      setter(null)
      return
    }
    if (!isValidImageFile(file)) {
      toast.error('Only JPG, JPEG, and PNG images are accepted')
      return
    }
    setter(file)
  }

  async function uploadDocuments(): Promise<boolean> {
    const hasFiles = identificationFile || businessPermitFile || documentFile
    if (!hasFiles) return true

    const formData = new FormData()
    if (identificationFile) formData.append('identification', identificationFile)
    if (businessPermitFile) formData.append('business_permit', businessPermitFile)
    if (documentFile) formData.append('document', documentFile)

    const result = await uploadDocumentsAction(formData)

    if (result.error) {
      toast.error(result.error)
      return false
    }
    return true
  }

  function handleNext() {
    if (step === 0 && !selectedType) {
      toast.error('Please select an owner type')
      return
    }
    if (step === 1 && !name.trim()) {
      toast.error('Please enter your full name')
      return
    }
    if (step === 1) {
      startTransition(async () => {
        const uploaded = await uploadDocuments()
        if (!uploaded) return

        const result = await completeOnboardingAction({
          full_name: name.trim(),
          user_type: selectedType!,
          nationality: nationality.trim() || undefined,
          contact_number: contactNumber.trim() || undefined,
        })
        if (result?.error) {
          toast.error(result.error)
          return
        }
        setStep(2)
      })
      return
    }
    setStep(step + 1)
  }

  function handleBack() {
    setStep(step - 1)
  }

  function handleSkipListing() {
    router.push('/dashboard')
  }

  function handleCreateListing(formData: FormData) {
    startTransition(async () => {
      let result
      if (selectedType === 'van_owner') {
        result = await createVanAction(formData)
      } else if (selectedType === 'hotel_owner') {
        result = await createAccommodationAction(formData)
      } else {
        result = await createTourAction(formData)
      }

      if (result.error) {
        toast.error(result.error)
        return
      }

      toast.success('Listing created. Pending approval.')
      router.push('/dashboard')
    })
  }

  return (
    <div>
      {/* Progress Bar */}
      <div className="mb-10">
        <div className="flex items-center justify-between">
          {['Owner Type', 'About You', 'First Listing'].map((label, i) => (
            <div key={label} className="flex flex-1 flex-col items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                  i <= step ? 'bg-primary text-white' : 'bg-surface-alt text-ink-tertiary',
                )}
              >
                {i + 1}
              </div>
              <span className="text-ink-tertiary text-xs font-medium">{label}</span>
            </div>
          ))}
        </div>
        <div className="bg-surface-alt mt-4 h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / 3) * 100}%` }}
          />
        </div>
      </div>

      {/* Step 1: Owner Type */}
      {step === 0 && (
        <div>
          <h1 className="text-ink font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            What kind of owner are you?
          </h1>
          <p className="text-ink-secondary mt-2 text-base">
            Choose the type of service you want to offer on Luzon Explore
          </p>

          <div className="mt-8 grid gap-4">
            {ownerOptions.map((option) => {
              const Icon = option.icon
              const isSelected = selectedType === option.value
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setSelectedType(option.value)}
                  className={cn(
                    'flex items-start gap-4 rounded-[var(--radius-card)] border-2 p-6 text-left transition-all duration-300',
                    isSelected
                      ? 'border-primary bg-primary-light shadow-card'
                      : 'border-border bg-surface hover:border-border-strong hover:shadow-card',
                  )}
                >
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-[var(--radius-input)]',
                      isSelected ? 'bg-primary text-white' : 'bg-surface-alt text-ink-tertiary',
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                      {option.label}
                    </p>
                    <p className="text-ink-secondary mt-1 text-sm">{option.description}</p>
                  </div>
                </button>
              )
            })}
          </div>

          <div className="mt-8">
            <Button onClick={handleNext} disabled={!selectedType} className="w-full" size="lg">
              Continue
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: About You */}
      {step === 1 && (
        <div>
          <h1 className="text-ink font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Tell us about yourself
          </h1>
          <p className="text-ink-secondary mt-2 text-base">
            This information helps travelers trust your listings
          </p>

          <div className="bg-surface shadow-card mt-8 space-y-6 rounded-[var(--radius-card)] p-8">
            <Input
              id="full_name"
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              required
            />
            <Input
              id="nationality"
              label="Nationality (optional)"
              value={nationality}
              onChange={(e) => setNationality(e.target.value)}
              placeholder="e.g., Filipino"
            />
            <Input
              id="contact_number"
              label="Contact Number (optional)"
              value={contactNumber}
              onChange={(e) => setContactNumber(e.target.value)}
              placeholder="e.g., +63 917 123 4567"
            />

            <div className="border-border space-y-5 border-t pt-6">
              <p className="text-ink font-[family-name:var(--font-display)] text-lg font-bold">
                Documents
              </p>
              <p className="text-ink-secondary -mt-3 text-sm">
                Upload your identification and business documents for verification
              </p>

              <FileUpload
                id="identification"
                label="Valid ID"
                fileName={identificationFile?.name ?? ''}
                onFileChange={(file) => handleFileSelect(file, setIdentificationFile)}
                onClear={() => setIdentificationFile(null)}
              />

              <FileUpload
                id="business_permit"
                label="Business Permit"
                fileName={businessPermitFile?.name ?? ''}
                onFileChange={(file) => handleFileSelect(file, setBusinessPermitFile)}
                onClear={() => setBusinessPermitFile(null)}
              />

              <FileUpload
                id="document"
                label="Supporting Document"
                fileName={documentFile?.name ?? ''}
                onFileChange={(file) => handleFileSelect(file, setDocumentFile)}
                onClear={() => setDocumentFile(null)}
              />
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <Button onClick={handleBack} variant="secondary" className="flex-1" size="lg">
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={isPending || !name.trim()}
              className="flex-1"
              size="lg"
            >
              {isPending ? 'Saving...' : 'Continue'}
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: First Listing (optional) */}
      {step === 2 && (
        <div>
          <h1 className="text-ink font-[family-name:var(--font-display)] text-3xl font-bold tracking-tight">
            Create your first listing
          </h1>
          <p className="text-ink-secondary mt-2 text-base">
            Get a head start by adding your first listing now, or skip and do it later
          </p>

          <div className="bg-surface shadow-card mt-8 rounded-[var(--radius-card)] p-8">
            <form action={handleCreateListing} className="space-y-6">
              {selectedType === 'van_owner' && <OnboardingVanFields />}
              {selectedType === 'hotel_owner' && <OnboardingAccommodationFields />}
              {selectedType === 'tour_operator' && <OnboardingTourFields />}

              <div className="border-border flex items-center justify-between border-t pt-6">
                <button
                  type="button"
                  onClick={handleSkipListing}
                  className="text-primary text-sm font-medium hover:underline"
                >
                  Skip for now
                </button>
                <Button type="submit" disabled={isPending} size="lg">
                  {isPending ? 'Creating...' : 'Create Listing'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function FileUpload({
  id,
  label,
  fileName,
  onFileChange,
  onClear,
}: {
  id: string
  label: string
  fileName: string
  onFileChange: (file: File | undefined) => void
  onClear: () => void
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-ink-secondary block text-sm font-medium">
        {label}
      </label>
      {fileName ? (
        <div className="border-border bg-surface-alt flex items-center gap-3 rounded-[var(--radius-input)] border px-4 py-2.5">
          <span className="text-ink min-w-0 flex-1 truncate text-sm">{fileName}</span>
          <button
            type="button"
            onClick={onClear}
            className="text-ink-tertiary hover:text-ink shrink-0 transition-colors"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className="border-border hover:border-border-strong hover:bg-surface-alt flex cursor-pointer flex-col items-center gap-2 rounded-[var(--radius-input)] border-2 border-dashed px-4 py-6 transition-colors"
        >
          <ArrowUpTrayIcon className="text-ink-tertiary h-6 w-6" />
          <span className="text-ink-secondary text-sm">Click to upload</span>
          <span className="text-ink-tertiary text-xs">JPG, JPEG, or PNG</span>
          <input
            id={id}
            type="file"
            accept=".jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => onFileChange(e.target.files?.[0])}
          />
        </label>
      )}
    </div>
  )
}

function OnboardingVanFields() {
  return (
    <>
      <Input
        id="name"
        name="name"
        label="Vehicle Name"
        placeholder="e.g., Toyota Grandia"
        required
      />
      <div className="grid grid-cols-2 gap-6">
        <Input
          id="capacity"
          name="capacity"
          label="Capacity"
          type="number"
          min={1}
          max={30}
          required
        />
        <select
          id="transmission"
          name="transmission"
          defaultValue="auto"
          className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
        >
          <option value="auto">Automatic</option>
          <option value="manual">Manual</option>
        </select>
      </div>
      <Input
        id="base_location"
        name="base_location"
        label="Base Location"
        placeholder="e.g., Manila, Metro Manila"
        required
      />
      <Input
        id="daily_rate"
        name="daily_rate"
        label="Daily Rate (PHP)"
        type="number"
        min={0}
        step={100}
        required
      />
      <input name="driver_included" type="hidden" value="true" />
    </>
  )
}

function OnboardingAccommodationFields() {
  return (
    <>
      <Input id="name" name="name" label="Name" placeholder="e.g., Pine View Lodge" required />
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label htmlFor="type" className="text-ink-secondary block text-sm font-medium">
            Type
          </label>
          <select
            id="type"
            name="type"
            defaultValue="hotel"
            className="border-border bg-surface text-ink focus:border-primary focus:ring-primary/20 block w-full rounded-[var(--radius-input)] border px-4 py-2.5 text-base transition-colors focus:ring-1 focus:outline-none"
          >
            <option value="hotel">Hotel</option>
            <option value="homestay">Homestay</option>
            <option value="resort">Resort</option>
          </select>
        </div>
        <Input
          id="price_per_night"
          name="price_per_night"
          label="Price / Night (PHP)"
          type="number"
          min={0}
          step={100}
          required
        />
      </div>
      <Input
        id="location"
        name="location"
        label="Location"
        placeholder="e.g., Baguio City, Benguet"
        required
      />
    </>
  )
}

function OnboardingTourFields() {
  return (
    <>
      <Input
        id="name"
        name="name"
        label="Tour Name"
        placeholder="e.g., Sagada Cave Connection"
        required
      />
      <Input
        id="location"
        name="location"
        label="Location"
        placeholder="e.g., Sagada, Mountain Province"
        required
      />
      <div className="grid grid-cols-2 gap-6">
        <Input
          id="duration_hours"
          name="duration_hours"
          label="Duration (hours)"
          type="number"
          min={0.5}
          step={0.5}
          required
        />
        <Input
          id="price_per_person"
          name="price_per_person"
          label="Price per Person (PHP)"
          type="number"
          min={0}
          step={50}
          required
        />
      </div>
      <Input
        id="max_group_size"
        name="max_group_size"
        label="Max Group Size"
        type="number"
        min={1}
        max={100}
        required
      />
    </>
  )
}
