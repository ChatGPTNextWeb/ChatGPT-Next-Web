export function initWebGL(
  canvas: HTMLCanvasElement,
  vertexShaderSource: string,
  fragmentShaderSource: string,
) {
  // 获取WebGL上下文
  const gl = canvas.getContext("webgl2", {
    premultipliedAlpha: true,
  });
  if (!gl) {
    console.error("无法初始化WebGL2上下文");
    return { gl: null, program: null };
  }

  // 创建着色器程序
  const program = createShaderProgram(
    gl,
    vertexShaderSource,
    fragmentShaderSource,
  );
  if (!program) {
    console.error("无法创建着色器程序");
    return { gl: null, program: null };
  }

  // 设置视口
  gl.viewport(0, 0, canvas.width, canvas.height);

  // 使用着色器程序
  gl.useProgram(program);

  return { gl, program };
}

function createShaderProgram(
  gl: WebGL2RenderingContext,
  vertexShaderSource: string,
  fragmentShaderSource: string,
): WebGLProgram | null {
  // 创建顶点着色器
  const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  if (!vertexShader) return null;

  // 创建片段着色器
  const fragmentShader = createShader(
    gl,
    gl.FRAGMENT_SHADER,
    fragmentShaderSource,
  );
  if (!fragmentShader) return null;

  // 创建着色器程序
  const program = gl.createProgram();
  if (!program) return null;

  // 附加着色器
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);

  // 链接程序
  gl.linkProgram(program);

  // 检查链接状态
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("无法初始化着色器程序:", gl.getProgramInfoLog(program));
    return null;
  }

  return program;
}

function createShader(
  gl: WebGL2RenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  // 创建着色器
  const shader = gl.createShader(type);
  if (!shader) return null;

  // 设置着色器源代码
  gl.shaderSource(shader, source);

  // 编译着色器
  gl.compileShader(shader);

  // 检查编译状态
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("着色器编译错误:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}
