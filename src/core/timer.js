/**
 * Cuenta regresiva desacoplada de la UI: avisa por callbacks en cada tick y
 * al expirar. Usa marcas de tiempo reales para no desfasarse aunque el
 * navegador retrase los intervalos.
 */
export class CountdownTimer {
  /**
   * @param {Object} opts
   * @param {number} opts.duration       Duración en segundos.
   * @param {(remaining:number, duration:number)=>void} opts.onTick
   * @param {()=>void} opts.onExpire
   * @param {number} [opts.tickInterval]  Frecuencia de actualización en ms.
   */
  constructor({ duration, onTick, onExpire, tickInterval = 100 }) {
    this.duration = duration;
    this.onTick = onTick;
    this.onExpire = onExpire;
    this.tickInterval = tickInterval;
    this._handle = null;
    this._endAt = 0;
    this._remaining = duration;
  }

  start() {
    this.stop();
    this._endAt = Date.now() + this.duration * 1000;
    this._tick();
    this._handle = setInterval(() => this._tick(), this.tickInterval);
  }

  _tick() {
    const remainingMs = Math.max(0, this._endAt - Date.now());
    this._remaining = remainingMs / 1000;
    if (this.onTick) this.onTick(this._remaining, this.duration);
    if (remainingMs <= 0) {
      this.stop();
      if (this.onExpire) this.onExpire();
    }
  }

  stop() {
    if (this._handle) {
      clearInterval(this._handle);
      this._handle = null;
    }
  }

  get remaining() {
    return this._remaining;
  }

  get elapsed() {
    return this.duration - this._remaining;
  }
}
