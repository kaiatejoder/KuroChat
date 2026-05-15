package com.kurochat;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/messages")
public class MessageController {

    @Autowired
    private MessageRepository messageRepository;

    @GetMapping
    public List<Message> getAllMessages() {
        return messageRepository.findAllByOrderByTimestampAsc();
    }

    @PostMapping
    public Message saveMessage(@RequestBody Map<String, String> payload) {
        String user = payload.get("user");
        String text = payload.get("text");

        Message message = new Message(user, text, LocalDateTime.now());
        return messageRepository.save(message);
    }

    @DeleteMapping("/{id}")
    public void deleteMessage(@PathVariable Long id) {
        messageRepository.deleteById(id);
    }
}