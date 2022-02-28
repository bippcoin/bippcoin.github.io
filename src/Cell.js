export default function Cell(props){
    let color;
    if(props.number == 0){
        color = "white"
    } else if(props.number == 1){
        color = "red"
    } else if(props.number == 2){
        color = "yellow"
    }
    return(
        <td bgcolor={color} onClick={props.onClick}>
        </td>
    )
}