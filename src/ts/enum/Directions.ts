/* calculating direction by number
 * temp = number % 2 == 1
 * (dx, dy) = num > 1 ? (0, temp)  : (tepm, 0)
 * num > direction
 * 0 > LEFT   (-1, 0 )
 * 1 > RIGHT  ( 1, 0 )
 * 2 > TOP    ( 0,-1 )
 * 3 > BOTTOM ( 0, 1 )
 */
export enum Direction {
    LEFT = 0,
    RIGHT = 1,
    TOP = 2,
    BOTTOM = 3,
}
