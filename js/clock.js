/**
 * Configuration for the segmented circle drawing.
 * @typedef {Object} CircleConfig
 * @property {number} canvasSize - The size (width and height) of the canvas.
 * @property {number} circleRadius - The radius of the circle.
 * @property {number} segments - The total number of segments in the circle.
 * @property {number} filledSegments - The number of segments that should be filled.
 * @property {string} segmentColor - The color for the filled segments.
 * @property {string} emptySegmentColor - The color for the empty segments.
 * @property {string} borderColor - The color for the border of the segments.
 */

const defaultConfig = {
    canvasSize: 600,
    circleRadius: 290,
    segments: 4, // Total number of segments
    filledSegments: 0, // Number of segments to be filled
    segmentColor: '#336633',
    emptySegmentColor: '#333333',
    borderColor: '#669966'
};

/**
 * @param {CircleConfig} config 
 * @returns {CircleConfig}
 */
function addDefaults(config) {
    config.canvasSize = config.canvasSize || defaultConfig.canvasSize
    config.circleRadius = config.circleRadius || defaultConfig.circleRadius
    config.segments = config.segments || defaultConfig.segments
    config.filledSegments = config.filledSegments || defaultConfig.filledSegments
    config.segmentColor = config.segmentColor || defaultConfig.segmentColor
    config.emptySegmentColor = config.emptySegmentColor || defaultConfig.emptySegmentColor
    config.borderColor = config.borderColor || defaultConfig.borderColor
    return config
}

/**
 * @param {CircleConfig} config 
 * @returns {string}
 */
function drawSegmentedCircle(config) {
    config = addDefaults(config)
    const canvas = document.createElement('canvas');
    canvas.width = config.canvasSize;
    canvas.height = config.canvasSize;
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    const angleIncrement = 2 * Math.PI / config.segments;
    let startAngle = -Math.PI / 2; // Start from the top

    for (let i = 0; i < config.segments; i++) {
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, config.circleRadius, startAngle, startAngle + angleIncrement);
        ctx.closePath();

        // Fill segment if it's one of the filled segments
        if (i < config.filledSegments) {
            ctx.fillStyle = config.segmentColor;
        } else {
            ctx.fillStyle = config.emptySegmentColor;
        }
        ctx.fill();

        // Draw border
        ctx.lineWidth = 5
        ctx.strokeStyle = config.borderColor;
        ctx.stroke();

        startAngle += angleIncrement;
    }
    return canvas.toDataURL();
}

export default drawSegmentedCircle