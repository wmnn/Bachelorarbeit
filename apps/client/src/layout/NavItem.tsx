export const NavItem = ({
  children,
  isLast = false,
  isActive = false,
}: {
  children: React.ReactNode;
  isLast?: boolean;
  isActive?: boolean;
}) => {
  return (
    <li
      className={`p-2 border-r border-t border-gray-800 hover:bg-gray-200 transition-all ${
        isLast ? 'border-r' : ''
      } cursor-pointer ${isActive ? 'bg-gray-800 font-medium text-white' : ''}`}
    >
      {children}
    </li>
  );
};
