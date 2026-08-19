// //package com.example.todo.Controller;
// //
// //import org.springframework.beans.factory.annotation.Autowired;
// //import org.springframework.http.HttpStatus;
// //import org.springframework.http.ResponseEntity;
// //import org.springframework.web.bind.annotation.PostMapping;
// //import org.springframework.web.bind.annotation.RequestBody;
// //import org.springframework.web.bind.annotation.RequestMapping;
// //import org.springframework.web.bind.annotation.RestController;
// //
// //import com.example.todo.AssignedTask;
// //import com.example.todo.Service.AIAssistantService;
// //import com.example.todo.Service.AssignedTaskService;
// //import com.example.todo.dto.AIAssistantDto;
// //
// //@RestController
// //@RequestMapping("/api/assistant")
// //public class AIAssistantController {
// //	@Autowired
// //	AIAssistantService aiAssistantService;
// //	
// //	@PostMapping("/sendData")
// //	public ResponseEntity<String> fetchData(@RequestBody AIAssistantDto dto){
// //		String res=aiAssistantService.handleUserMessage(dto.getUserId(),dto.getUserMessage());
// //
// //		return new ResponseEntity<>(res, HttpStatus.OK);
// //
// //	}
// //
// //}

package com.example.todo.Controller;

import com.example.todo.Service.AIAssistantService;
import com.example.todo.dto.AIAssistantRequestDto;
import com.example.todo.dto.AIAssistantResponseDto;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/gemini")
public class AIAssistantController {

    @Autowired
    private AIAssistantService aiAssistantService;

    @PostMapping("/chat")
    public AIAssistantResponseDto chat(@RequestBody AIAssistantRequestDto dto) {
        return aiAssistantService.handleUserMessage(dto.getUserId(), dto.getUserMessage());
    }

   
}
