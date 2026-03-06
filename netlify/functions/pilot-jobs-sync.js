const { syncPilotJobs } = require('./_pilot-jobs-core');

function jsonResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    },
    body: JSON.stringify(body)
  };
}

exports.handler = async () => {
  try {
    const result = await syncPilotJobs({
      sourceLimit: 4,
      maxPagesPerSource: 24,
      maxDepth: 2
    });

    return jsonResponse(200, {
      ok: true,
      mode: 'scheduled-sync',
      ...result,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return jsonResponse(500, {
      ok: false,
      error: 'Pilot jobs scheduled sync failed',
      details: error.message
    });
  }
};

