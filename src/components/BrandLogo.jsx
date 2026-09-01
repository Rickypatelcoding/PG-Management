import logo from '../assets/Logo.svg'

export default function BrandLogo({ iconOnly = false }) {
  return <div className="flex items-center gap-3"><img src={logo} alt="" aria-hidden="true" className="h-6 w-7 object-contain" /><span className={iconOnly ? 'sr-only' : 'text-[15px] font-bold tracking-tight'}>PG Management</span></div>
}
