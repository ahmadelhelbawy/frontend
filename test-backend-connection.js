/**
 * Test script to verify backend connection and API endpoints
 */

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001';

async function testBackendConnection() {
  console.log('🔍 Testing backend connection...\n');
  
  // Test 1: Health check
  try {
    console.log('🏥 Testing health check endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status === 'healthy' ? 'PASSED' : 'FAILED');
    console.log('   Response:', JSON.stringify(healthData, null, 2));
  } catch (error) {
    console.log('❌ Health check: FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  
  // Test 2: GPU health check
  try {
    console.log('🖥️ Testing GPU health check endpoint...');
    const gpuResponse = await fetch(`${BASE_URL}/api/v1/health/gpu`);
    const gpuData = await gpuResponse.json();
    console.log('✅ GPU health check:', gpuData.status === 'healthy' ? 'PASSED' : 'FAILED');
    console.log('   GPU Available:', gpuData.gpu_available);
    console.log('   CUDA Available:', gpuData.cuda_available);
    console.log('   FPS:', gpuData.performance_metrics?.avg_fps || 'N/A');
  } catch (error) {
    console.log('❌ GPU health check: FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  
  // Test 3: Camera endpoints
  try {
    console.log('📹 Testing camera endpoints...');
    const camerasResponse = await fetch(`${BASE_URL}/api/v1/cameras`);
    const camerasData = await camerasResponse.json();
    console.log('✅ Camera list:', camerasResponse.ok ? 'PASSED' : 'FAILED');
    console.log('   Cameras found:', camerasData.cameras?.length || camerasData.length || 0);
  } catch (error) {
    console.log('❌ Camera list: FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  
  // Test 4: Detection endpoints
  try {
    console.log('👁️ Testing detection endpoints...');
    const detectionsResponse = await fetch(`${BASE_URL}/api/v1/detections?limit=5`);
    const detectionsData = await detectionsResponse.json();
    console.log('✅ Recent detections:', detectionsResponse.ok ? 'PASSED' : 'FAILED');
    console.log('   Detections found:', detectionsData.detections?.length || detectionsData.length || 0);
  } catch (error) {
    console.log('❌ Recent detections: FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  
  // Test 5: Alert endpoints
  try {
    console.log('🚨 Testing alert endpoints...');
    const alertsResponse = await fetch(`${BASE_URL}/api/v1/detections/alerts`);
    const alertsData = await alertsResponse.json();
    console.log('✅ Active alerts:', alertsResponse.ok ? 'PASSED' : 'FAILED');
    console.log('   Alerts found:', alertsData.length || 0);
  } catch (error) {
    console.log('❌ Active alerts: FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  
  // Test 6: Dashboard summary
  try {
    console.log('📊 Testing dashboard summary endpoint...');
    const dashboardResponse = await fetch(`${BASE_URL}/api/v1/dashboard/summary`);
    const dashboardData = await dashboardResponse.json();
    console.log('✅ Dashboard summary:', dashboardResponse.ok ? 'PASSED' : 'FAILED');
    console.log('   Active cameras:', dashboardData.activeCameras || dashboardData.active_cameras || 0);
    console.log('   Total detections:', dashboardData.totalDetections || dashboardData.total_detections || 0);
    console.log('   Active alerts:', dashboardData.activeAlerts || dashboardData.active_alerts || 0);
  } catch (error) {
    console.log('❌ Dashboard summary: FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('');
  
  // Test 7: WebSocket connection
  try {
    console.log('🔌 Testing WebSocket connection...');
    const protocol = BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
    const host = new URL(BASE_URL).host;
    const wsUrl = `${protocol}//${host}/api/v1/dashboard/ws/live`;
    
    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log('✅ WebSocket connection: PASSED');
      ws.close();
    };
    
    ws.onerror = (error) => {
      console.log('❌ WebSocket connection: FAILED');
      console.log('   Error:', error.message);
      ws.close();
    };
  } catch (error) {
    console.log('❌ WebSocket connection: FAILED');
    console.log('   Error:', error.message);
  }
  
  console.log('\n🎉 Backend connection test completed!');
}

// Run the test
testBackendConnection();
