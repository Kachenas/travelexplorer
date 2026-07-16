import { Navbar } from '@/components/ui/Navbar'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="pt-[72px]">{children}</div>
    </>
  )
}
