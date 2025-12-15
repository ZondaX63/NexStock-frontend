import { styled, keyframes } from '@mui/material/styles';
import { Paper, Typography, Box } from '@mui/material';
import Button from '@mui/material/Button';

// Animations
export const fadeInDown = keyframes`
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

export const zoomIn = keyframes`
  from { opacity: 0; transform: scale(0.8); }
  to { opacity: 1; transform: scale(1); }
`;

// Styled Paper for main containers
export const AppBox = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  background: theme.palette.background.paper,
  backdropFilter: 'blur(8px)',
  borderRadius: theme.shape.borderRadius * 1.25,
  boxShadow: '0 4px 24px rgba(44,62,80,0.07)',
  width: '100%',
  maxWidth: '100%',
  textAlign: 'center',
  border: '1px solid #e0e3e7',
  margin: '0 auto',
  animation: `${fadeInUp} 0.8s ease-out`,
}));

export const AppTitle = styled(Typography)(({ theme }) => ({
  fontSize: '2.2rem',
  fontWeight: 700,
  color: theme.palette.secondary.main,
  marginBottom: theme.spacing(4),
  animation: `${fadeInDown} 0.8s ease-out`,
}));

export const AppSubtitle = styled(Typography)(({ theme }) => ({
  fontSize: '1.15rem',
  color: theme.palette.text.secondary,
  marginBottom: theme.spacing(5),
  animation: `${fadeInUp} 0.8s ease-out`,
}));

export const StyledButton = styled(Button)(({ theme }) => ({
  fontSize: '1rem',
  padding: '12px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'scale(1.05)',
  },
}));

export const AppButtonGroup = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexWrap: 'wrap',
  gap: '1rem',
  alignItems: 'center',
  marginBottom: theme.spacing(2),
  marginTop: theme.spacing(1),
  '@media (max-width: 600px)': {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: '0.5rem',
  },
}));

export const AppButton = styled(Button)(({ theme }) => ({
  fontSize: '1rem',
  padding: '12px 24px',
  borderRadius: '8px',
  textTransform: 'none',
  boxShadow: theme.shadows[2],
  transition: 'all 0.3s ease',
  '&:hover': {
    boxShadow: theme.shadows[4],
    transform: 'scale(1.05)',
  },
}));