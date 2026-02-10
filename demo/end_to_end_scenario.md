# End-to-End Scenario

## Goal
Demonstrate that one AI employee preserves identity, memory, and intent across call → email → chat.

## Steps
1. Open dashboard and enter Gemini API key.
2. Send `/call` message:
   - "Merhaba, geçen haftaki paket için bilgi alıyordum."
3. Send `/email` with same `contact_id`:
   - "Konuşmamızı mailde devam ettirelim, fiyatı tekrar paylaşır mısın?"
4. Send `/chat` with same `contact_id`:
   - "Ödemeye geçiyorum, son adım neydi?"

## Expected outcomes
- Replies retain persona tone and continuity.
- Memory snapshot shows process accumulation.
- Drift score is visible for each turn.
- Trace shows which agent performed each action.
