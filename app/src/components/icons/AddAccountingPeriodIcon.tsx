import { createIcon } from '@chakra-ui/icon';

const AddAccountingPeriodIcon = createIcon({
  displayName: 'AddAccountingPeriodIcon',
  viewBox: '0 0 24 24',
  path: (
    <g fill='none'>
      {/* Background rectangle */}
      <rect width='24' height='24' rx='4' ry='4' fill='#626262' />

      {/* Main calendar box */}
      <rect x='2' y='2' width='20' height='20' rx='2' ry='2' fill='#edf7f7' />

      {/* Top line separator */}
      <rect x='3' y='8' width='18' height='1' fill='#6a6a6a' />

      {/* Header blocks */}
      <rect x='6' y='3' width='2' height='3' rx='1' ry='1' fill='#121212' />
      <rect x='16' y='3' width='2' height='3' rx='1' ry='1' fill='#121212' />

      {/* Period blocks */}
      <rect x='6' y='10' width='4' height='2' fill='#626262' />
      <rect x='12' y='10' width='4' height='2' fill='#626262' />
      <rect x='6' y='13' width='4' height='2' fill='#626262' />
      <rect x='12' y='13' width='4' height='2' fill='#626262' />
      <rect x='6' y='16' width='4' height='2' fill='#626262' />
      <rect x='12' y='16' width='4' height='2' fill='#626262' />

      {/* Add symbol */}
      <path d='M20 16h-2v3h-3v2h3v3h2v-3h3v-2h-3v-3z' fill='#3182ce' />
    </g>
  ),
});

export default AddAccountingPeriodIcon;
