#ifndef SERIAL_H
#define SERIAL_H

void serial_init(void);
void serial_write(char c);
void serial_print(const char *s);

#define LOG(s)        serial_print(s)
void log_hex(unsigned long long value);
#define LOG_HEX(x)    log_hex((unsigned long long)(x))

int serial_received(void);
char serial_read_char(void);

#endif 