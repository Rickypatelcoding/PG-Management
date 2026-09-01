export default function ActionButton({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const styles = { primary: 'bg-[#e27d00] text-[#1a1a1a] hover:bg-[#bb5602]', secondary: 'bg-[#f5f5f5] text-[#292929] hover:bg-[#e6e6e6]', outline: 'border border-[#e6e6e6] bg-white text-[#292929] hover:bg-[#fafafa]', ghost: 'text-[#575757] hover:bg-[#f5f5f5]', danger: 'bg-[#dc2626] text-white hover:bg-[#b91c1c]' }
  const sizes = { sm: 'min-h-8 px-3 text-xs', md: 'min-h-10 px-4 text-sm', lg: 'min-h-12 px-5 text-sm' }
  return <button className={`focusable inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors duration-150 disabled:cursor-not-allowed disabled:bg-[#e6e6e6] disabled:text-[#a5a5a5] ${styles[variant]} ${sizes[size]} ${className}`} {...props}>{children}</button>
}
