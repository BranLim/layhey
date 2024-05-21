import { createIcon } from '@chakra-ui/icon';

const AddAccountingPeriodIcon = createIcon({
  displayName: 'AddAccountingPeriodIcon',
  viewBox: '0 0 24 24',
  path: (
    <g fill='none'>
      {/* Background rectangle */}
      <rect width='24' height='24' rx='2' ry='2' fill='#f3e5f5' />

      {/* Main calendar box */}
      <rect x='3' y='4' width='18' height='18' rx='2' ry='2' fill='#ffffff' />

      {/* Top line separator */}
      <rect x='3' y='8' width='18' height='1' fill='#7e57c2' />

      {/* Header blocks */}
      <rect x='6' y='3' width='2' height='3' rx='1' ry='1' fill='#7e57c2' />
      <rect x='16' y='3' width='2' height='3' rx='1' ry='1' fill='#7e57c2' />

      {/* Period blocks */}
      <rect x='6' y='10' width='4' height='2' fill='#9575cd' />
      <rect x='12' y='10' width='4' height='2' fill='#9575cd' />
      <rect x='6' y='13' width='4' height='2' fill='#9575cd' />
      <rect x='12' y='13' width='4' height='2' fill='#9575cd' />
      <rect x='6' y='16' width='4' height='2' fill='#9575cd' />
      <rect x='12' y='16' width='4' height='2' fill='#9575cd' />

      {/* Add symbol */}
      <path d='M20 16h-2v3h-3v2h3v3h2v-3h3v-2h-3v-3z' fill='#858585' />
    </g>
  ),
});

export default AddAccountingPeriodIcon;
