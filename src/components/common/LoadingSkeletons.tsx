/**
 * Loading Skeleton Components
 * Provides skeleton loaders that match the expected content layout for better UX
 */

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Skeleton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Grid,
  Paper
} from '@mui/material';

// Quick Stats Card Skeleton
export const StatsCardSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Skeleton variant="rectangular" width={48} height={48} sx={{ borderRadius: 1 }} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={80} height={32} />
          <Skeleton variant="text" width={120} height={20} />
        </Box>
      </Stack>
    </CardContent>
  </Card>
);

// System Health Progress Skeleton
export const SystemHealthSkeleton: React.FC = () => (
  <Card>
    <CardHeader
      title={<Skeleton variant="text" width={150} height={24} />}
      action={<Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />}
    />
    <CardContent>
      <Stack spacing={2}>
        {[...Array(4)].map((_, index) => (
          <Box key={index}>
            <Box display="flex" justifyContent="space-between" mb={1}>
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="text" width={40} height={16} />
            </Box>
            <Skeleton variant="rectangular" height={6} sx={{ borderRadius: 1 }} />
          </Box>
        ))}
      </Stack>
    </CardContent>
  </Card>
);

// Performance Chart Skeleton
export const ChartSkeleton: React.FC = () => (
  <Card>
    <CardHeader
      title={<Skeleton variant="text" width={180} height={24} />}
    />
    <CardContent>
      <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 1 }} />
    </CardContent>
  </Card>
);

// Services Table Skeleton
export const ServicesTableSkeleton: React.FC = () => (
  <Card>
    <CardHeader
      title={<Skeleton variant="text" width={150} height={24} />}
      action={<Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />}
    />
    <CardContent>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Skeleton variant="text" width={120} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={60} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={90} /></TableCell>
              <TableCell><Skeleton variant="text" width={110} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Skeleton variant="circular" width={8} height={8} />
                    <Skeleton variant="text" width={150} />
                  </Stack>
                </TableCell>
                <TableCell><Skeleton variant="rectangular" width={70} height={20} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="text" width={50} /></TableCell>
                <TableCell><Skeleton variant="text" width={80} /></TableCell>
                <TableCell><Skeleton variant="text" width={40} /></TableCell>
                <TableCell><Skeleton variant="text" width={40} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

// Users Table Skeleton
export const UsersTableSkeleton: React.FC = () => (
  <Card>
    <CardContent>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={60} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
              <TableCell><Skeleton variant="text" width={100} /></TableCell>
              <TableCell><Skeleton variant="text" width={120} /></TableCell>
              <TableCell><Skeleton variant="text" width={80} /></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {[...Array(8)].map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Stack direction="row" alignItems="center" spacing={2}>
                    <Skeleton variant="circular" width={32} height={32} />
                    <Box>
                      <Skeleton variant="text" width={120} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>
                  </Stack>
                </TableCell>
                <TableCell><Skeleton variant="rectangular" width={80} height={20} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} /></TableCell>
                <TableCell><Skeleton variant="text" width={140} /></TableCell>
                <TableCell>
                  <Stack direction="row" spacing={0.5}>
                    <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />
                    <Skeleton variant="rectangular" width={30} height={20} sx={{ borderRadius: 1 }} />
                  </Stack>
                </TableCell>
                <TableCell>
                  <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </CardContent>
  </Card>
);

// Camera Card Skeleton
export const CameraCardSkeleton: React.FC = () => (
  <Card>
    <CardHeader
      title={<Skeleton variant="text" width={140} />}
      subheader={<Skeleton variant="text" width={100} />}
      action={<Skeleton variant="rectangular" width={60} height={20} sx={{ borderRadius: 1 }} />}
    />
    <CardContent>
      <Stack spacing={2}>
        <Box>
          <Skeleton variant="text" width={80} height={16} />
          <Skeleton variant="text" width={120} height={20} />
        </Box>
        <Box>
          <Skeleton variant="text" width={90} height={16} />
          <Skeleton variant="text" width={100} height={20} />
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="text" width={100} height={16} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          <Skeleton variant="text" width={80} height={16} />
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 1 }} />
        </Stack>
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

// AI Performance Metrics Skeleton
export const AIPerformanceSkeleton: React.FC = () => (
  <Card>
    <CardHeader
      title={<Skeleton variant="text" width={180} height={24} />}
    />
    <CardContent>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={2}>
            <Box>
              <Skeleton variant="text" width={120} height={16} />
              <Skeleton variant="text" width={60} height={32} />
            </Box>
            <Box>
              <Skeleton variant="text" width={140} height={16} />
              <Skeleton variant="text" width={80} height={32} />
            </Box>
            <Box>
              <Skeleton variant="text" width={100} height={16} />
              <Skeleton variant="text" width={40} height={32} />
            </Box>
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Skeleton variant="rectangular" height={150} sx={{ borderRadius: 1 }} />
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// Generic Loading Spinner
export const LoadingSpinner: React.FC<{ size?: 'small' | 'medium' | 'large' }> = ({ 
  size = 'medium' 
}) => {
  const sizeMap = {
    small: 24,
    medium: 40,
    large: 64
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3
      }}
    >
      <Skeleton 
        variant="circular" 
        width={sizeMap[size]} 
        height={sizeMap[size]}
        animation="wave"
      />
    </Box>
  );
};

// Full Page Loading
export const PageLoadingSkeleton: React.FC = () => (
  <Box sx={{ p: 3 }}>
    {/* Header skeleton */}
    <Paper sx={{ p: 2, mb: 3 }}>
      <Stack direction="row" alignItems="center" spacing={2}>
        <Skeleton variant="rectangular" width={32} height={32} sx={{ borderRadius: 1 }} />
        <Skeleton variant="text" width={300} height={32} />
        <Box sx={{ ml: 'auto' }}>
          <Skeleton variant="rectangular" width={100} height={36} sx={{ borderRadius: 1 }} />
        </Box>
      </Stack>
    </Paper>

    {/* Quick stats skeleton */}
    <Grid container spacing={3} sx={{ mb: 3 }}>
      {[...Array(4)].map((_, index) => (
        <Grid item xs={12} md={3} key={index}>
          <StatsCardSkeleton />
        </Grid>
      ))}
    </Grid>

    {/* Main content skeleton */}
    <Paper>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', p: 1 }}>
        <Stack direction="row" spacing={2}>
          {[...Array(6)].map((_, index) => (
            <Skeleton key={index} variant="text" width={120} height={40} />
          ))}
        </Stack>
      </Box>
      
      <Box sx={{ p: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <SystemHealthSkeleton />
          </Grid>
          <Grid item xs={12} md={6}>
            <ChartSkeleton />
          </Grid>
          <Grid item xs={12}>
            <ServicesTableSkeleton />
          </Grid>
        </Grid>
      </Box>
    </Paper>
  </Box>
);
